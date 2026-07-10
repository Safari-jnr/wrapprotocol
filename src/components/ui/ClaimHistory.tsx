// Server Component — reads claim history from Supabase mirror
// Not the source of truth; on-chain is. This is for display convenience.

import { createServerAnonClient } from "@/lib/supabase/server";
import { EVM_EXPLORER, EVM_CHAIN, SOLANA_EXPLORER_BASE } from "@/lib/constants";

export async function ClaimHistory() {
  const supabase = await createServerAnonClient();

  const { data: claims, error } = await supabase
    .from("claims")
    .select("*")
    .order("claimed_at", { ascending: false })
    .limit(10);

  if (error || !claims || claims.length === 0) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-white/30 text-center">
        No claims recorded yet.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-white/10 overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/10 bg-white/5">
            <th className="px-4 py-2 text-left text-xs text-white/40 font-medium">Wallet</th>
            <th className="px-4 py-2 text-left text-xs text-white/40 font-medium">Chain</th>
            <th className="px-4 py-2 text-left text-xs text-white/40 font-medium">Tokens</th>
            <th className="px-4 py-2 text-left text-xs text-white/40 font-medium">Tx</th>
          </tr>
        </thead>
        <tbody>
          {claims.map((claim) => {
            const explorerUrl =
              claim.chain === "evm"
                ? `${EVM_EXPLORER[EVM_CHAIN]}/tx/${claim.tx_hash}`
                : `${SOLANA_EXPLORER_BASE}/tx/${claim.tx_hash}`;

            return (
              <tr key={claim.id} className="border-b border-white/5 hover:bg-white/5">
                <td className="px-4 py-2 font-mono text-xs text-white/50">
                  {claim.wallet_address.slice(0, 6)}…{claim.wallet_address.slice(-4)}
                </td>
                <td className="px-4 py-2 text-xs text-white/50 uppercase">
                  {claim.chain}
                </td>
                <td className="px-4 py-2 text-xs text-violet-300">
                  {claim.token_amount}
                </td>
                <td className="px-4 py-2">
                  <a
                    href={explorerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-violet-400 underline"
                  >
                    {claim.tx_hash.slice(0, 8)}… ↗
                  </a>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
