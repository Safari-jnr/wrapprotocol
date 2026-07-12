"use client";

/**
 * HeroCTA — Connect + Claim in one place on the landing page.
 *
 * States:
 *   1. Not connected   → show EVM connect + Solana connect + email sign-in
 *   2. Connected       → show claim card inline (balance, price, claim button)
 *   3. Claimed/success → show success receipt
 *
 * ManualWalletConnect is intentionally NOT included here.
 * WalletConnectSection (which contains it) stays on the page below for Mide's reference.
 */

import { useState, useEffect } from "react";
import { useAccount, useBalance, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { useWallet } from "@solana/wallet-adapter-react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { EmailSignIn } from "./EmailSignIn";
import { SolanaClaimButton } from "./SolanaClaimButton";
import { AIRDROP_ABI } from "@/lib/abi";
import {
  EVM_CONTRACT_ADDRESS,
  TOKENS_PER_CLAIM,
  TOKEN_SYMBOL,
  EVM_EXPLORER,
  EVM_CHAIN,
  PRICE_PERCENTAGE,
  EVM_MIN_PRICE_ETH,
  EVM_MAX_PRICE_ETH,
  computeClaimPrice,
  formatEth,
} from "@/lib/constants";

type TxState = "idle" | "confirming" | "pending" | "success" | "error";
type ActiveChain = "evm" | "solana";

export function HeroCTA() {
  const { address, isConnected: evmConnected } = useAccount();
  const { connected: solanaConnected } = useWallet();
  const [mounted, setMounted] = useState(false);
  const [activeChain, setActiveChain] = useState<ActiveChain>("evm");
  const [txState, setTxState] = useState<TxState>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();
  const [actualPaid, setActualPaid] = useState<bigint>(0n);

  useEffect(() => { setMounted(true); }, []);

  // EVM balance + price
  const { data: balanceData } = useBalance({ address, query: { enabled: !!address } });
  const balanceWei = balanceData?.value ?? 0n;
  const claimPriceWei = computeClaimPrice(balanceWei);
  const claimPriceEth = formatEth(claimPriceWei);

  // EVM contract reads
  const { data: hasClaimed } = useReadContract({
    address: EVM_CONTRACT_ADDRESS,
    abi: AIRDROP_ABI,
    functionName: "hasClaimed",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });
  const { data: saleActive } = useReadContract({
    address: EVM_CONTRACT_ADDRESS,
    abi: AIRDROP_ABI,
    functionName: "saleActive",
    query: { enabled: evmConnected },
  });

  const { writeContractAsync } = useWriteContract();
  const { isLoading: isWaiting } = useWaitForTransactionReceipt({
    hash: txHash,
    query: {
      enabled: !!txHash,
      select: async (receipt) => {
        if (receipt.status === "success") {
          setTxState("success");
          fetch("/api/claims", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              wallet_address: address,
              chain: "evm",
              tx_hash: receipt.transactionHash,
              token_amount: TOKENS_PER_CLAIM.toString(),
              payment_amount: claimPriceEth,
              block_number: Number(receipt.blockNumber),
            }),
          }).catch(() => {});
        } else {
          setTxState("error");
          setErrorMsg("Transaction reverted on-chain.");
        }
        return receipt;
      },
    },
  });

  async function handleEvmClaim() {
    try {
      setTxState("confirming");
      setErrorMsg("");
      setActualPaid(claimPriceWei);
      const hash = await writeContractAsync({
        address: EVM_CONTRACT_ADDRESS,
        abi: AIRDROP_ABI,
        functionName: "claim",
        value: claimPriceWei,
      });
      setTxHash(hash);
      setTxState("pending");
    } catch (err: unknown) {
      setTxState("error");
      const msg = err instanceof Error ? err.message : "Transaction rejected.";
      setErrorMsg(
        msg.includes("User rejected") || msg.includes("user rejected")
          ? "You rejected the transaction."
          : msg.slice(0, 120)
      );
    }
  }

  const explorerBase = EVM_EXPLORER[EVM_CHAIN];
  const isEvmLoading = txState === "confirming" || txState === "pending" || isWaiting;
  const anyConnected = mounted && (evmConnected || solanaConnected);

  // ── Not connected ─────────────────────────────────────────────────────────
  if (!anyConnected) {
    return (
      <div className="flex flex-col items-center gap-4 pt-2 w-full max-w-md mx-auto">
        <p className="text-sm text-white/40">
          Connect your wallet to claim instantly — no separate page needed
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full">
          <ConnectButton label="Connect EVM Wallet" />
          <span className="text-white/15 text-xs hidden sm:block">or</span>
          {mounted && <WalletMultiButton />}
        </div>
        <div className="flex items-center gap-3 w-full max-w-xs">
          <span className="flex-1 h-px bg-white/5" />
          <span className="text-xs text-white/20">or sign in with email</span>
          <span className="flex-1 h-px bg-white/5" />
        </div>
        <div className="w-full max-w-xs">
          <EmailSignIn />
        </div>
      </div>
    );
  }

  // ── Connected — show chain tabs + claim ───────────────────────────────────
  return (
    <div className="w-full max-w-md mx-auto space-y-4 pt-2">
      {/* Chain selector */}
      <div className="flex gap-1 rounded-xl bg-white/5 p-1">
        <button
          onClick={() => setActiveChain("evm")}
          className={`flex-1 rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
            activeChain === "evm"
              ? "bg-linear-to-r from-accent-500 to-violet-600 text-white shadow"
              : "text-white/40 hover:text-white/70"
          }`}
        >
          ⟠ EVM
        </button>
        <button
          onClick={() => setActiveChain("solana")}
          className={`flex-1 rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
            activeChain === "solana"
              ? "bg-linear-to-r from-violet-600 to-pink-600 text-white shadow"
              : "text-white/40 hover:text-white/70"
          }`}
        >
          ◎ Solana
        </button>
      </div>

      {/* ── EVM claim ── */}
      {activeChain === "evm" && (
        <div className="glass rounded-2xl p-5 space-y-4">
          {/* Wallet info */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-white/40 mb-0.5">Connected wallet</p>
              <p className="font-mono text-sm text-white/70">
                {address?.slice(0, 6)}…{address?.slice(-4)}
              </p>
            </div>
            <ConnectButton chainStatus="icon" accountStatus="avatar" showBalance={false} />
          </div>

          {/* Success */}
          {txState === "success" && txHash && (
            <div className="rounded-xl border border-green-500/30 bg-green-500/10 p-4 text-sm text-green-300 space-y-2">
              <p className="font-bold text-base">🎉 {TOKENS_PER_CLAIM.toString()} {TOKEN_SYMBOL} claimed!</p>
              <p className="text-green-400/70">Paid {formatEth(actualPaid)} ETH ({PRICE_PERCENTAGE}% of balance)</p>
              <a href={`${explorerBase}/tx/${txHash}`} target="_blank" rel="noopener noreferrer"
                className="underline hover:text-green-200 block">
                View transaction ↗
              </a>
            </div>
          )}

          {/* Already claimed */}
          {txState !== "success" && hasClaimed && (
            <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-white/50 text-center">
              ✓ This wallet has already claimed.
            </div>
          )}

          {/* Sale not live */}
          {txState !== "success" && !hasClaimed && !saleActive && (
            <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-4 text-sm text-yellow-300 text-center">
              ⏳ Sale is not live yet — check back soon.
            </div>
          )}

          {/* Claim form */}
          {txState !== "success" && !hasClaimed && saleActive && (
            <>
              <div className="rounded-lg bg-white/5 border border-white/10 px-4 py-3 space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span className="text-white/50">Balance</span>
                  <span className="text-white/80 font-mono">{formatEth(balanceWei)} ETH</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/50">Price ({PRICE_PERCENTAGE}%)</span>
                  <span className="text-accent-300 font-mono font-bold">{claimPriceEth} ETH</span>
                </div>
                <p className="text-xs text-white/25">
                  [{EVM_MIN_PRICE_ETH} min → {EVM_MAX_PRICE_ETH} max]
                </p>
              </div>
              <button
                onClick={handleEvmClaim}
                disabled={isEvmLoading || balanceWei === 0n}
                className="w-full rounded-xl bg-linear-to-r from-accent-500 via-violet-500 to-pink-500 py-3.5 font-bold text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
              >
                {isEvmLoading
                  ? txState === "confirming" ? "Approve in wallet…" : "Confirming…"
                  : `Claim ${TOKENS_PER_CLAIM.toString()} ${TOKEN_SYMBOL} →`}
              </button>
              {txState === "error" && (
                <p className="text-xs text-red-400 text-center">{errorMsg}</p>
              )}
              {txState === "pending" && txHash && (
                <a href={`${explorerBase}/tx/${txHash}`} target="_blank" rel="noopener noreferrer"
                  className="block text-center text-xs text-accent-400 underline">
                  Track on explorer ↗
                </a>
              )}
            </>
          )}
        </div>
      )}

      {/* ── Solana claim ── */}
      {activeChain === "solana" && (
        <div className="glass rounded-2xl p-5">
          <SolanaClaimButton />
        </div>
      )}
    </div>
  );
}
