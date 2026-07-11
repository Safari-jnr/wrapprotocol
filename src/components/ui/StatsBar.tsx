// Server component — fetches stats from Supabase at request time

import { createServerAnonClient } from "@/lib/supabase/server";
import { TOKEN_SYMBOL, TOKENS_PER_CLAIM } from "@/lib/constants";

export async function StatsBar() {
  const supabase = await createServerAnonClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: stats } = await (supabase.from("sale_stats") as any)
    .select("*")
    .eq("id", 1)
    .single() as { data: { total_claimed_evm: number; total_claimed_solana: number; total_raised_eth: string; total_raised_sol: string } | null };

  const totalClaimed =
    (stats?.total_claimed_evm ?? 0) + (stats?.total_claimed_solana ?? 0);
  const totalRaisedEth = stats?.total_raised_eth ?? "0";
  const totalRaisedSol = stats?.total_raised_sol ?? "0";

  return (
    <div className="flex flex-wrap justify-center gap-8 text-center">
      <Stat label="Wallets claimed" value={totalClaimed.toLocaleString()} />
      <Stat label="ETH raised" value={`${totalRaisedEth}`} sub="ETH" />
      <Stat label="SOL raised" value={`${totalRaisedSol}`} sub="SOL" />
      <Stat
        label="Per wallet"
        value={`${TOKENS_PER_CLAIM.toLocaleString()}`}
        sub={TOKEN_SYMBOL}
      />
    </div>
  );
}

function Stat({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="min-w-[110px]">
      <p className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
        {value}
        {sub && (
          <span className="text-base font-normal text-white/30 ml-1">
            {sub}
          </span>
        )}
      </p>
      <p className="text-xs text-white/40 uppercase tracking-wider mt-1">
        {label}
      </p>
    </div>
  );
}
