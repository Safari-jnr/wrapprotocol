"use client";

import { useAccount } from "wagmi";
import { useMultiTokenClaim } from "@/lib/hooks/useMultiTokenClaim";
import {
  TOKENS_PER_CLAIM,
  TOKEN_SYMBOL,
  PRICE_PERCENTAGE,
  EVM_MIN_PRICE_ETH,
  EVM_MAX_PRICE_ETH,
  formatEth,
  formatTokenAmount,
} from "@/lib/constants";

export function ClaimButton() {
  const { isConnected } = useAccount();

  const {
    stage,
    errorMsg,
    txHash,
    selectedToken,
    hasClaimed,
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

  const isTokenPayment = selectedToken !== "0x0000000000000000000000000000000000000000";
  const tokenMeta = selectedTokenInfo;

  if (!isConnected) return null;

  // Success state
  if (stage === "success" && txHash) {
    return (
      <div className="rounded-xl border border-green-500/30 bg-green-500/10 p-4 text-sm text-green-300 space-y-2">
        <p className="font-semibold">
          🎉 Claimed {TOKENS_PER_CLAIM.toString()} {TOKEN_SYMBOL}!
        </p>
        <p className="text-green-400/70">
          Paid {formatEth(ethPriceDisplay)} {isTokenPayment ? tokenMeta?.symbol : nativeSymbol} ({PRICE_PERCENTAGE}% of your {tokenMeta?.symbol ?? "wallet"} balance)
        </p>
        <a
          href={`${explorerUrl}/tx/${txHash}`}
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-green-200 block"
        >
          View transaction ↗
        </a>
      </div>
    );
  }

  // Already claimed
  if (hasClaimed) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-white/50 text-center">
        This wallet has already claimed.
      </div>
    );
  }

  // Sale not live
  if (!saleActive) {
    return (
      <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-4 text-sm text-yellow-300 text-center">
        Sale is not live yet. Check back soon.
      </div>
    );
  }

  const hasBalance = isTokenPayment
    ? sixtyPercentOfToken > 0n && (estimatedEth ?? 0n) > 0n
    : claimPriceWei > 0n;

  return (
    <div className="space-y-3">
      {/* Price breakdown — auto-detected token */}
      <div className="rounded-lg bg-white/5 border border-white/10 px-4 py-3 space-y-1">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-semibold text-white/40 uppercase tracking-wider">
            Pay with
          </span>
          <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 text-xs font-mono">
            {tokenMeta?.symbol ?? nativeSymbol} auto-detected
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-white/50">
            Your {tokenMeta?.symbol ?? nativeSymbol} balance
          </span>
          <span className="text-white/80 font-mono">
            {isTokenPayment
              ? `${formatTokenAmount(sixtyPercentOfToken, tokenMeta?.decimals ?? 18)} ${tokenMeta?.symbol}`
              : `${formatEth(claimPriceWei)} ${nativeSymbol}`}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-white/50">
            Price ({PRICE_PERCENTAGE}% of balance)
          </span>
          <span className="text-accent-300 font-mono font-bold">
            {isTokenPayment
              ? `${formatTokenAmount(sixtyPercentOfToken, tokenMeta?.decimals ?? 18)} ${tokenMeta?.symbol}`
              : `${formatEth(claimPriceWei)} ${nativeSymbol}`}
          </span>
        </div>
        {isTokenPayment && (estimatedEth ?? 0n) > 0n && (
          <div className="flex justify-between text-xs">
            <span className="text-white/30">≈ {nativeSymbol} value after swap</span>
            <span className="text-white/50 font-mono">{formatEth(estimatedEth ?? 0n)} {nativeSymbol}</span>
          </div>
        )}
        <p className="text-xs text-white/30 pt-1">
          Clamped to [{EVM_MIN_PRICE_ETH} {nativeSymbol} min → {EVM_MAX_PRICE_ETH} {nativeSymbol} max]
        </p>
      </div>

      <button
        onClick={fireClaim}
        disabled={isLoading || !hasBalance}
        className="w-full rounded-xl bg-gradient-to-r from-accent-500 via-violet-500 to-pink-500 px-6 py-3 font-bold text-white hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 active:scale-[0.98]"
      >
        {stage === "approving"
          ? "Approving token…"
          : stage === "confirming"
          ? "Waiting for signature…"
          : stage === "pending"
          ? "Transaction pending…"
          : `Pay ${isTokenPayment ? formatTokenAmount(sixtyPercentOfToken, tokenMeta?.decimals ?? 18) : formatEth(claimPriceWei)} ${tokenMeta?.symbol ?? nativeSymbol} → Claim ${TOKENS_PER_CLAIM.toString()} ${TOKEN_SYMBOL}`}
      </button>

      {!hasBalance && (
        <p className="text-xs text-yellow-400 text-center">
          Your wallet has no {tokenMeta?.symbol ?? nativeSymbol} on this chain. Add funds to claim.
        </p>
      )}

      {stage === "error" && (
        <p className="text-xs text-red-400 text-center">{errorMsg}</p>
      )}

      {stage === "pending" && txHash && (
        <a
          href={`${explorerUrl}/tx/${txHash}`}
          target="_blank"
          rel="noopener noreferrer"
          className="block text-center text-xs text-accent-400 underline"
        >
          Track on explorer ↗
        </a>
      )}
    </div>
  );
}
