// Dashboard — EVM + Solana claim flows, claim history, wallet info
import { Suspense } from "react";
import { ClaimHistory } from "@/components/ui/ClaimHistory";
import { WalletInfo } from "@/components/ui/WalletInfo";
import { ChainClaimPanel } from "@/components/ui/ChainClaimPanel";
import { TOKEN_SYMBOL, TOKENS_PER_CLAIM, PRICE_PERCENTAGE } from "@/lib/constants";

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 space-y-8">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-white/50 text-sm">
          Price is {PRICE_PERCENTAGE}% of your wallet balance.
          Claim status is read live from the contract — this UI is display only.
        </p>
      </div>

      {/* Wallet info */}
      <WalletInfo />

      {/* Claim card — tabbed EVM / Solana */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-5">
        <div>
          <h2 className="font-bold text-lg">
            {TOKENS_PER_CLAIM.toString()} {TOKEN_SYMBOL}
          </h2>
          <p className="text-sm text-white/50">
            Pay {PRICE_PERCENTAGE}% of your balance · one claim per wallet per chain
          </p>
        </div>

        {/* Chain tab switcher + claim buttons */}
        <ChainClaimPanel />
      </div>

      {/* Claim history */}
      <div className="space-y-3">
        <h2 className="font-semibold text-white/70">Claim History</h2>
        <Suspense
          fallback={
            <div className="h-20 animate-pulse rounded-xl bg-white/5" />
          }
        >
          <ClaimHistory />
        </Suspense>
      </div>
    </div>
  );
}
