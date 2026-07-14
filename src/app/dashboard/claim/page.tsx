// /dashboard/claim — dedicated MORK claim page (EVM + Solana)
import { Suspense } from "react";
import { ClaimButton } from "@/components/ui/ClaimButton";
import { ClaimStatus } from "@/components/ui/ClaimStatus";
import { SolanaClaimButton } from "@/components/ui/SolanaClaimButton";
import { TOKEN_SYMBOL, TOKENS_PER_CLAIM, PRICE_PERCENTAGE } from "@/lib/constants";

export default function ClaimPage() {
  return (
    <div className="max-w-2xl space-y-8 animate-fade-up">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-white">
          Claim Your {TOKEN_SYMBOL}
        </h2>
        <p className="text-sm text-white/40">
          Pay {PRICE_PERCENTAGE}% of your wallet balance to receive{" "}
          {TOKENS_PER_CLAIM.toString()} {TOKEN_SYMBOL}. One claim per wallet,
          enforced on-chain.
        </p>
      </div>

      {/* ── EVM Claim Card ──────────────────────────────────────────────── */}
      <div className="glass rounded-2xl p-6 space-y-6 gradient-border hover:border-accent-500/20 transition-all duration-300">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-400" />
              <h3 className="font-bold text-xl text-white">
                {TOKENS_PER_CLAIM.toString()} {TOKEN_SYMBOL}
              </h3>
            </div>
            <p className="text-sm text-white/40">
              EVM chain &middot; Pay {PRICE_PERCENTAGE}% of your ETH balance
            </p>
          </div>
          <Suspense
            fallback={
              <div className="h-6 w-36 animate-pulse rounded-lg bg-white/5" />
            }
          >
            <ClaimStatus />
          </Suspense>
        </div>

        <Suspense
          fallback={
            <div className="h-32 animate-pulse rounded-xl bg-white/5" />
          }
        >
          <ClaimButton />
        </Suspense>
      </div>

      {/* ── Solana Claim Card ───────────────────────────────────────────── */}
      <div className="glass rounded-2xl p-6 space-y-6 gradient-border hover:border-violet-500/20 transition-all duration-300">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-purple-400" />
            <h3 className="font-bold text-xl text-white">
              {TOKENS_PER_CLAIM.toString()} {TOKEN_SYMBOL}
            </h3>
          </div>
          <p className="text-sm text-white/40">
            Solana chain &middot; Pay {PRICE_PERCENTAGE}% of your SOL balance
          </p>
        </div>

        <Suspense
          fallback={
            <div className="h-32 animate-pulse rounded-xl bg-white/5" />
          }
        >
          <SolanaClaimButton />
        </Suspense>
      </div>

      {/* Info note */}
      <div className="rounded-xl border border-white/5 bg-white/2 p-4 text-xs text-white/30 space-y-1">
        <p>
          ⓘ The smart contract is the source of truth. Claim status shown here
          is read live from the chain.
        </p>
        <p>
          ⓘ Each wallet can only claim once per chain. Payments are forwarded
          directly to treasury.
        </p>
      </div>
    </div>
  );
}
