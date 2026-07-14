"use client";

/**
 * LiveClaimFeed — Inline live claim feed on the landing page.
 *
 * Shows the most recent MORK claims from Supabase in real-time.
 * Subscribes to new inserts via Supabase Realtime.
 * New claims slide in at the top; old ones fade out after a max of 5 visible.
 */

import { useState, useEffect, useCallback } from "react";
import { useSupabase } from "@/components/providers/SupabaseProvider";
import { TOKEN_SYMBOL, EVM_EXPLORER, EVM_CHAIN, SOLANA_EXPLORER_BASE } from "@/lib/constants";

type ClaimItem = {
  id: string;
  wallet_address: string;
  chain: "evm" | "solana";
  tx_hash: string;
  token_amount: string;
  payment_amount: string;
  claimed_at: string;
  isNew?: boolean;
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  return `${h}h ago`;
}

function shortAddr(addr: string): string {
  if (!addr) return "";
  return addr.slice(0, 6) + "…" + addr.slice(-4);
}

export function LiveClaimFeed() {
  const { supabase } = useSupabase();
  const [claims, setClaims] = useState<ClaimItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalClaimed, setTotalClaimed] = useState(0);

  // Fetch initial recent claims
  useEffect(() => {
    async function fetchInitial() {
      const { data } = await supabase
        .from("claims")
        .select("id,wallet_address,chain,tx_hash,token_amount,payment_amount,claimed_at")
        .order("claimed_at", { ascending: false })
        .limit(5);

      const { data: stats } = await supabase
        .from("sale_stats")
        .select("total_claimed_evm,total_claimed_solana")
        .eq("id", 1)
        .single();

      if (data) setClaims(data as ClaimItem[]);
      if (stats) {
        setTotalClaimed(
          (stats.total_claimed_evm ?? 0) + (stats.total_claimed_solana ?? 0)
        );
      }
      setLoading(false);
    }
    fetchInitial();
  }, [supabase]);

  // Subscribe to new claims in real-time
  const addClaim = useCallback((row: ClaimItem) => {
    setClaims((prev) => {
      const updated = [{ ...row, isNew: true }, ...prev].slice(0, 5);
      return updated;
    });
    setTotalClaimed((n) => n + 1);
    // Remove isNew flag after animation
    setTimeout(() => {
      setClaims((prev) =>
        prev.map((c) => (c.id === row.id ? { ...c, isNew: false } : c))
      );
    }, 600);
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel("feed-claims")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "claims" },
        (payload) => addClaim(payload.new as ClaimItem)
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [supabase, addClaim]);

  return (
    <div className="w-full max-w-md mx-auto space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-success" />
          </span>
          <p className="text-xs font-semibold text-white/60 uppercase tracking-wider">
            Live Claims
          </p>
        </div>
        <p className="text-xs text-white/30">
          {totalClaimed.toLocaleString()} total claimed
        </p>
      </div>

      {/* Feed */}
      <div className="glass rounded-2xl overflow-hidden divide-y divide-white/5">
        {loading ? (
          // Skeleton
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3 animate-pulse">
              <div className="w-8 h-8 rounded-full bg-white/5 shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 bg-white/5 rounded w-2/3" />
                <div className="h-2.5 bg-white/5 rounded w-1/3" />
              </div>
              <div className="h-3 bg-white/5 rounded w-16 shrink-0" />
            </div>
          ))
        ) : claims.length === 0 ? (
          <div className="px-4 py-8 text-center space-y-1">
            <p className="text-3xl">🪐</p>
            <p className="text-sm text-white/30">No claims yet — be the first!</p>
          </div>
        ) : (
          claims.map((claim) => {
            const explorerUrl =
              claim.chain === "evm"
                ? `${EVM_EXPLORER[EVM_CHAIN]}/tx/${claim.tx_hash}`
                : `${SOLANA_EXPLORER_BASE}/tx/${claim.tx_hash}`;

            return (
              <div
                key={claim.id}
                className={`flex items-center gap-3 px-4 py-3 transition-all duration-500 ${
                  claim.isNew ? "bg-success/5 animate-fade-in" : "hover:bg-white/2"
                }`}
              >
                {/* Chain icon */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm font-bold ${
                    claim.chain === "evm"
                      ? "bg-blue-500/15 text-blue-300"
                      : "bg-purple-500/15 text-purple-300"
                  }`}
                >
                  {claim.chain === "evm" ? "⟠" : "◎"}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 space-y-0.5">
                  <p className="text-xs font-mono text-white/60 truncate">
                    {shortAddr(claim.wallet_address)}
                  </p>
                  <p className="text-[10px] text-white/30">
                    {timeAgo(claim.claimed_at)}
                    {claim.isNew && (
                      <span className="ml-2 text-success font-semibold">
                        NEW
                      </span>
                    )}
                  </p>
                </div>

                {/* Amount + link */}
                <div className="text-right shrink-0 space-y-0.5">
                  <p className="text-xs font-bold text-accent-300">
                    +{claim.token_amount} {TOKEN_SYMBOL}
                  </p>
                  <a
                    href={explorerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] text-white/20 hover:text-accent-400 transition-colors"
                  >
                    tx ↗
                  </a>
                </div>
              </div>
            );
          })
        )}
      </div>

      <p className="text-center text-[10px] text-white/20">
        Powered by on-chain data · The contract is the source of truth
      </p>
    </div>
  );
}
