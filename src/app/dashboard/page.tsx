// Dashboard — reads claim status live from contract (EVM) + history from Supabase
// Server Component shell; interactive claim button is Client Component

import { Suspense } from "react";
import { ClaimButton } from "@/components/ui/ClaimButton";
import { ClaimStatus } from "@/components/ui/ClaimStatus";
import { ClaimHistory } from "@/components/ui/ClaimHistory";
import { WalletInfo } from "@/components/ui/WalletInfo";
import { TOKEN_SYMBOL, TOKENS_PER_CLAIM, PRICE_PERCENTAGE } from "@/lib/constants";

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 space-y-8">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-white/50 text-sm">
          Claim status is read directly from the contract — this page is display only.
        </p>
      </div>

      {/* Wallet info panel */}
      <WalletInfo />

      {/* Claim card */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-5">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h2 className="font-bold text-lg">
              {TOKENS_PER_CLAIM.toString()} {TOKEN_SYMBOL}
            </h2>
            <p className="text-sm text-white/50">
              Pay {PRICE_PERCENTAGE}% of your ETH balance · one claim per wallet
            </p>
          </div>
          {/* Live eligibility indicator — client component reads from contract */}
          <Suspense fallback={<div className="h-5 w-32 animate-pulse rounded bg-white/10" />}>
            <ClaimStatus />
          </Suspense>
        </div>

        {/* Claim button — handles tx lifecycle */}
        <ClaimButton />
      </div>

      {/* Claim history from Supabase mirror */}
      <div className="space-y-3">
        <h2 className="font-semibold text-white/70">Claim History</h2>
        <Suspense fallback={<div className="h-20 animate-pulse rounded-xl bg-white/5" />}>
          <ClaimHistory />
        </Suspense>
      </div>
    </div>
  );
}
