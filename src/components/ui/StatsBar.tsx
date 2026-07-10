// Server component — fetches stats from Supabase at request time

import { createServerAnonClient } from "@/lib/supabase/server";

export async function StatsBar() {
  const supabase = await createServerAnonClient();

  const { data: stats } = await supabase
    .from("sale_stats")
    .select("*")
    .eq("id", 1)
    .single();

  const totalClaimed =
    (stats?.total_claimed_evm ?? 0) + (stats?.total_claimed_solana ?? 0);
  const totalRaisedEth = stats?.total_raised_eth ?? "0";
  const totalRaisedSol = stats?.total_raised_sol ?? "0";

  return (
    <div className="flex flex-wrap justify-center gap-6 text-center">
      <Stat label="Wallets claimed" value={totalClaimed.toLocaleString()} />
      <Stat label="ETH raised" value={`${totalRaisedEth} ETH`} />
      <Stat label="SOL raised" value={`${totalRaisedSol} SOL`} />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-[120px]">
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-xs text-white/50 uppercase tracking-wider mt-1">{label}</p>
    </div>
  );
}
