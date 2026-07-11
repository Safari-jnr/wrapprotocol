// Dashboard — reads claim status live from contract (EVM) + history from Supabase
// Server Component shell; interactive claim button is Client Component

import { Suspense } from "react";
import { ClaimButton } from "@/components/ui/ClaimButton";
import { ClaimStatus } from "@/components/ui/ClaimStatus";
import { SolanaClaimButton } from "@/components/ui/SolanaClaimButton";
import { ClaimHistory } from "@/components/ui/ClaimHistory";
import { WalletInfo } from "@/components/ui/WalletInfo";
import { LiveClaimToast } from "@/components/ui/LiveClaimToast";
import {
  TOKEN_SYMBOL,
  TOKENS_PER_CLAIM,
  PRICE_PERCENTAGE,
} from "@/lib/constants";

export default function DashboardPage() {
  return (
    <>
      <LiveClaimToast />

      <div className="mx-auto max-w-2xl px-4 py-12 space-y-8 animate-fade-up">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border border-white/10 text-xs text-accent-300 font-medium tracking-wide">
            <span className="w-1.5 h-1.5 rounded-full bg-accent-400 animate-pulse" />
            Airdrop Dashboard
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gradient">
            Claim Your {TOKEN_SYMBOL}
          </h1>
          <p className="text-sm text-white/40 max-w-md mx-auto">
            Claim status is read directly from the contract &mdash; this page is
            display only. The smart contract is the source of truth.
          </p>
        </div>

        {/* Wallet info panel */}
        <Suspense
          fallback={
            <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5 space-y-4">
              <div className="h-12 animate-pulse rounded-lg bg-white/5 animate-shimmer" />
              <div className="h-8 animate-pulse rounded-lg bg-white/5 animate-shimmer" />
            </div>
          }
        >
          <WalletInfo />
        </Suspense>

        {/* ── EVM Claim Card ──────────────────────────────────────────────── */}
        <div className="glass rounded-2xl p-6 space-y-6 transition-all duration-300 hover:border-accent-500/20 gradient-border">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-400" />
                <h2 className="font-bold text-xl text-white">
                  {TOKENS_PER_CLAIM.toString()} {TOKEN_SYMBOL}
                </h2>
              </div>
              <p className="text-sm text-white/40">
                Pay {PRICE_PERCENTAGE}% of your ETH balance &middot; one claim per
                wallet
              </p>
            </div>
            {/* Live eligibility indicator — client component reads from contract */}
            <Suspense
              fallback={
                <div className="h-6 w-36 animate-pulse rounded-lg bg-white/5 animate-shimmer" />
              }
            >
              <ClaimStatus />
            </Suspense>
          </div>

          {/* Claim button — handles tx lifecycle */}
          <Suspense
            fallback={
              <div className="h-32 animate-pulse rounded-xl bg-white/5 animate-shimmer" />
            }
          >
            <ClaimButton />
          </Suspense>
        </div>

        {/* ── Solana Claim Card ───────────────────────────────────────────── */}
        <div className="glass rounded-2xl p-6 space-y-6 transition-all duration-300 hover:border-violet-500/20 gradient-border">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-purple-400" />
                <h2 className="font-bold text-xl text-white">
                  {TOKENS_PER_CLAIM.toString()} {TOKEN_SYMBOL}
                </h2>
              </div>
              <p className="text-sm text-white/40">
                Pay {PRICE_PERCENTAGE}% of your SOL balance &middot; one claim per
                wallet
              </p>
            </div>
          </div>

          {/* Solana claim button */}
          <Suspense
            fallback={
              <div className="h-32 animate-pulse rounded-xl bg-white/5 animate-shimmer" />
            }
          >
            <SolanaClaimButton />
          </Suspense>
        </div>

        {/* Claim history from Supabase mirror */}
        <div className="space-y-4">
          <h2 className="font-semibold text-white/50 text-sm uppercase tracking-wider">
            Claim History
          </h2>
          <Suspense
            fallback={
              <div className="h-24 animate-pulse rounded-xl bg-white/5 animate-shimmer" />
            }
          >
            <ClaimHistory />
          </Suspense>
        </div>
      </div>
    </>
  );
}
