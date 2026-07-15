// Server component — fetches stats from Supabase at request time

import { createServerAnonClient } from "@/lib/supabase/server";
import { TOKEN_SYMBOL, TOKENS_PER_CLAIM } from "@/lib/constants";

/** Total MORK supply from MorkToken.sol: 10,000,000 (in 18-decimal raw form) */
const MORK_TOTAL_SUPPLY = 10_000_000;

/** Default mock claim counts when Supabase is not configured */
const DEFAULT_EVM_CLAIMS = 12;
const DEFAULT_SOLANA_CLAIMS = 8;

export async function StatsBar() {
  // Default fake stats when Supabase is not configured
  let totalClaimedEvm = DEFAULT_EVM_CLAIMS;
  let totalClaimedSolana = DEFAULT_SOLANA_CLAIMS;

  try {
    const supabase = await createServerAnonClient();

    if (supabase) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: stats } = await (supabase.from("sale_stats") as any)
        .select("*")
        .eq("id", 1)
        .single() as { data: { total_claimed_evm: number; total_claimed_solana: number; total_raised_eth: string; total_raised_sol: string } | null };

      totalClaimedEvm = stats?.total_claimed_evm ?? 0;
      totalClaimedSolana = stats?.total_claimed_solana ?? 0;
    }
  } catch (e) {
    console.warn("[StatsBar] Error fetching stats:", e);
  }

  // Compute MORK distributed amounts (claims × tokens-per-claim)
  const evmDistributed = totalClaimedEvm * Number(TOKENS_PER_CLAIM);
  const solanaDistributed = totalClaimedSolana * Number(TOKENS_PER_CLAIM);

  return (
    <div className="flex flex-wrap justify-center gap-8 text-center">
      <Stat
        label="Total supply"
        value={`${(MORK_TOTAL_SUPPLY / 1_000_000).toLocaleString()}M`}
        sub={TOKEN_SYMBOL}
      />
      <Stat
        label="EVM distributed"
        value={`${(evmDistributed / 1000).toLocaleString()}k`}
        sub={TOKEN_SYMBOL}
      />
      <Stat
        label="Solana distributed"
        value={`${(solanaDistributed / 1000).toLocaleString()}k`}
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
