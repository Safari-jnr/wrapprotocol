"use client";

import { useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useSolanaClaim } from "@/lib/solana/useSolanaClaim";
import {
  TOKEN_SYMBOL,
  TOKENS_PER_CLAIM,
  PRICE_PERCENTAGE,
  SOL_MIN_PRICE_LAMPORTS,
  SOL_MAX_PRICE_LAMPORTS,
  SOLANA_NETWORK,
} from "@/lib/constants";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";

export function SolanaClaimButton() {
  const { connected, publicKey } = useWallet();
  const {
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
  } = useSolanaClaim();

  // Load on-chain state when wallet connects
  useEffect(() => {
    if (connected && publicKey) {
      refresh();
    }
  }, [connected, publicKey, refresh]);

  if (!connected) {
    return (
      <div className="space-y-2">
        <p className="text-sm text-white/50 text-center">
          Connect a Solana wallet to claim
        </p>
        <WalletMultiButton className="w-full! rounded-xl! bg-linear-to-r! from-violet-600! to-indigo-600! text-white! font-bold! py-3!" />
      </div>
    );
  }

  // Success
  if (state === "success" && txSig) {
    return (
      <div className="rounded-xl border border-green-500/30 bg-green-500/10 p-4 text-sm text-green-300 space-y-2">
        <p className="font-semibold">
          🎉 Claimed {TOKENS_PER_CLAIM.toString()} {TOKEN_SYMBOL} on Solana!
        </p>
        <p className="text-green-400/70">
          You paid {claimPriceSol} SOL ({PRICE_PERCENTAGE}% of your balance)
        </p>
        {explorerUrl && (
          <a
            href={explorerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-green-200 block"
          >
            View transaction ↗
          </a>
        )}
      </div>
    );
  }

  // Already claimed
  if (hasClaimed) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-white/50 text-center">
        This Solana wallet has already claimed.
      </div>
    );
  }

  // Sale not live
  if (saleActive === false) {
    return (
      <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-4 text-sm text-yellow-300 text-center">
        Solana sale is not live yet.
      </div>
    );
  }

  const isLoading =
    state === "loading" ||
    state === "confirming" ||
    state === "pending";

  const hasBalance = solBalance > 0;
  const solMinFormatted = (SOL_MIN_PRICE_LAMPORTS / LAMPORTS_PER_SOL).toFixed(3);
  const solMaxFormatted = (SOL_MAX_PRICE_LAMPORTS / LAMPORTS_PER_SOL).toFixed(1);

  return (
    <div className="space-y-3">
      {/* Price breakdown */}
      <div className="rounded-lg bg-white/5 border border-white/10 px-4 py-3 space-y-1">
        <div className="flex justify-between text-sm">
          <span className="text-white/50">Your SOL balance</span>
          <span className="text-white/80 font-mono">{solBalance.toFixed(4)} SOL</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-white/50">
            Price ({PRICE_PERCENTAGE}% of balance)
          </span>
          <span className="text-violet-300 font-mono font-bold">
            {claimPriceSol} SOL
          </span>
        </div>
        <p className="text-xs text-white/30 pt-1">
          Clamped to [{solMinFormatted} SOL min → {solMaxFormatted} SOL max] ·{" "}
          {SOLANA_NETWORK}
        </p>
      </div>

      <button
        onClick={handleClaim}
        disabled={isLoading || !hasBalance || saleActive === null}
        className="w-full rounded-xl bg-linear-to-r from-violet-600 to-indigo-600 px-6 py-3 font-bold text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
      >
        {state === "loading"
          ? "Loading…"
          : state === "confirming"
          ? "Waiting for signature…"
          : state === "pending"
          ? "Transaction pending…"
          : `Pay ${claimPriceSol} SOL → Claim ${TOKENS_PER_CLAIM.toString()} ${TOKEN_SYMBOL}`}
      </button>

      {!hasBalance && (
        <p className="text-xs text-yellow-400 text-center">
          Your Solana wallet has no SOL. Add SOL to claim.
        </p>
      )}

      {state === "error" && (
        <p className="text-xs text-red-400 text-center">{error}</p>
      )}

      {state === "pending" && explorerUrl && (
        <a
          href={explorerUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block text-center text-xs text-violet-400 underline"
        >
          Track on Solana Explorer ↗
        </a>
      )}
    </div>
  );
}
