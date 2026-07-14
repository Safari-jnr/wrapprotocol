// /dashboard/history — full claim history table
import { Suspense } from "react";
import { ClaimHistory } from "@/components/ui/ClaimHistory";

export default function HistoryPage() {
  return (
    <div className="max-w-4xl space-y-8 animate-fade-up">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold text-white">Claim History</h2>
        <p className="text-sm text-white/40">
          All confirmed claims for your connected wallet, mirrored from the
          on-chain events.
        </p>
      </div>

      <Suspense
        fallback={
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="h-14 animate-pulse rounded-xl bg-white/5"
              />
            ))}
          </div>
        }
      >
        <ClaimHistory />
      </Suspense>
    </div>
  );
}
