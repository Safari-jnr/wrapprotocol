// Server Component — reads claim history from Supabase mirror
// Not the source of truth; on-chain is. This is for display convenience.

import { createServerAnonClient } from "@/lib/supabase/server";
import { EVM_EXPLORER, EVM_CHAIN, SOLANA_EXPLORER_BASE } from "@/lib/constants";

export async function ClaimHistory({ limit = 20 }: { limit?: number }) {
  const supabase = await createServerAnonClient();

  type ClaimRow = {
    id: string;
    wallet_address: string;
    chain: "evm" | "solana";
    tx_hash: string;
    token_amount: string;
    payment_amount: string;
    claimed_at: string;
    block_number: number | null;
  };

  const { data: claims, error } = await (supabase.from("claims").select("*")
    .order("claimed_at", { ascending: false })
    .limit(limit)) as unknown as {
    data: ClaimRow[] | null;
    error: unknown;
  };

  if (error || !claims || claims.length === 0) {
    return (
      <div className="glass rounded-xl p-8 text-center space-y-2">
        <div className="text-3xl">📋</div>
        <p className="text-sm text-white/30">No claims recorded yet.</p>
        <p className="text-xs text-white/20">
          Be the first to claim your tokens!
        </p>
      </div>
    );
  }

  return (
    <div className="glass rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5 bg-white/2">
              <th className="px-4 py-3 text-left text-xs text-white/30 font-medium uppercase tracking-wider">
                Wallet
              </th>
              <th className="px-4 py-3 text-left text-xs text-white/30 font-medium uppercase tracking-wider">
                Chain
              </th>
              <th className="px-4 py-3 text-left text-xs text-white/30 font-medium uppercase tracking-wider">
                Amount
              </th>
              <th className="px-4 py-3 text-left text-xs text-white/30 font-medium uppercase tracking-wider">
                Tx
              </th>
            </tr>
          </thead>
          <tbody>
            {claims.map((claim) => {
              const explorerUrl =
                claim.chain === "evm"
                  ? `${EVM_EXPLORER[EVM_CHAIN]}/tx/${claim.tx_hash}`
                  : `${SOLANA_EXPLORER_BASE}/tx/${claim.tx_hash}`;

              return (
                <tr
                  key={claim.id}
                  className="border-b border-white/5 transition-colors duration-150 hover:bg-white/2"
                >
                  <td className="px-4 py-3 font-mono text-xs text-white/40">
                    {claim.wallet_address.slice(0, 6)}&hellip;{claim.wallet_address.slice(-4)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
                        claim.chain === "evm"
                          ? "bg-blue-500/10 text-blue-400"
                          : "bg-purple-500/10 text-purple-400"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          claim.chain === "evm" ? "bg-blue-400" : "bg-purple-400"
                        }`}
                      />
                      {claim.chain}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-accent-300 font-medium">
                    {claim.token_amount}
                  </td>
                  <td className="px-4 py-3">
                    <a
                      href={explorerUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-accent-400 hover:text-accent-300 transition-colors"
                    >
                      {claim.tx_hash.slice(0, 8)}&hellip;
                      <svg
                        className="w-3 h-3"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                        />
                      </svg>
                    </a>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
