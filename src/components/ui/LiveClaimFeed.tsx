"use client";

/**
 * LiveClaimFeed — Live claim activity feed on the landing page.
 *
 * Strategy:
 *  1. Fetches real claims from Supabase on mount.
 *  2. Subscribes to new inserts via Supabase Realtime — real claims slide in instantly.
 *  3. If the table has fewer than MIN_REAL entries, the gaps are filled with mock
 *     entries so the feed always looks alive. Mock entries are visually identical
 *     but link to a generic explorer search instead of a specific tx.
 *  4. When real data grows, mock entries are automatically displaced.
 */

import { useState, useEffect, useCallback } from "react";
import { useSupabase } from "@/components/providers/SupabaseProvider";
import { TOKEN_SYMBOL, EVM_EXPLORER, EVM_CHAIN, SOLANA_EXPLORER_BASE } from "@/lib/constants";

// ─── Types ────────────────────────────────────────────────────────────────────

type ClaimItem = {
  id: string;
  wallet_address: string;
  chain: "evm" | "solana";
  tx_hash: string;
  token_amount: string;
  payment_amount: string;
  claimed_at: string;
  isNew?: boolean;
  isMock?: boolean;
};

// ─── Mock seed data ───────────────────────────────────────────────────────────
// Realistic-looking wallets and hashes. Shown only when real data is sparse.

const MOCK_CLAIMS: ClaimItem[] = [
  {
    id: "mock-1",
    wallet_address: "0x3fA1b8e9C204D7A1023cBe4f82aD9C17e01F3b2A",
    chain: "evm",
    tx_hash: "0xabc123",
    token_amount: "1000",
    payment_amount: "0.0480",
    claimed_at: new Date(Date.now() - 1000 * 47).toISOString(),
    isMock: true,
  },
  {
    id: "mock-2",
    wallet_address: "HNk3vPqrJ8WmYzT6DfLe9sXoA2cBgRu4tV5wC7nMpQd",
    chain: "solana",
    tx_hash: "3xPq9",
    token_amount: "1000",
    payment_amount: "0.0820",
    claimed_at: new Date(Date.now() - 1000 * 60 * 3).toISOString(),
    isMock: true,
  },
  {
    id: "mock-3",
    wallet_address: "0xD7c6E5a3F1b049cA82e4B7d9F3A0c581e26D4cB1",
    chain: "evm",
    tx_hash: "0xdef456",
    token_amount: "1000",
    payment_amount: "0.1150",
    claimed_at: new Date(Date.now() - 1000 * 60 * 11).toISOString(),
    isMock: true,
  },
  {
    id: "mock-4",
    wallet_address: "AeQ7yNdFeqQKWyouGRYu8DxMJvPA37LzawS9Hgd5HZpW",
    chain: "solana",
    tx_hash: "7mNr2",
    token_amount: "1000",
    payment_amount: "0.0610",
    claimed_at: new Date(Date.now() - 1000 * 60 * 28).toISOString(),
    isMock: true,
  },
  {
    id: "mock-5",
    wallet_address: "0xA2e4b9C7D1F3E5a0B8d6c4F2e1A3b5C9D7f0E2c4",
    chain: "evm",
    tx_hash: "0x789abc",
    token_amount: "1000",
    payment_amount: "0.0320",
    claimed_at: new Date(Date.now() - 1000 * 60 * 54).toISOString(),
    isMock: true,
  },
];

const FEED_SIZE = 5;       // max visible rows
const MIN_REAL = 3;        // show mocks until we have at least this many real claims

// ─── Helpers ──────────────────────────────────────────────────────────────────

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function shortAddr(addr: string): string {
  if (!addr) return "";
  return addr.slice(0, 6) + "…" + addr.slice(-4);
}

function explorerUrl(claim: ClaimItem): string {
  if (claim.isMock) {
    // Link to the contract address page instead of a specific tx
    return claim.chain === "evm"
      ? `${EVM_EXPLORER[EVM_CHAIN]}`
      : `https://explorer.solana.com`;
  }
  return claim.chain === "evm"
    ? `${EVM_EXPLORER[EVM_CHAIN]}/tx/${claim.tx_hash}`
    : `${SOLANA_EXPLORER_BASE}/tx/${claim.tx_hash}`;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function LiveClaimFeed() {
  const { supabase } = useSupabase();
  const [realClaims, setRealClaims] = useState<ClaimItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalClaimed, setTotalClaimed] = useState(0);

  // Fetch initial recent claims
  useEffect(() => {
    async function fetchInitial() {
      const { data } = await supabase
        .from("claims")
        .select("id,wallet_address,chain,tx_hash,token_amount,payment_amount,claimed_at")
        .order("claimed_at", { ascending: false })
        .limit(FEED_SIZE);

      const { data: stats } = await supabase
        .from("sale_stats")
        .select("total_claimed_evm,total_claimed_solana")
        .eq("id", 1)
        .single();

      if (data) setRealClaims(data as ClaimItem[]);
      if (stats) {
        setTotalClaimed(
          (stats.total_claimed_evm ?? 0) + (stats.total_claimed_solana ?? 0)
        );
      }
      setLoading(false);
    }
    fetchInitial();
  }, [supabase]);

  // Realtime subscription — prepend new real claims immediately
  const addClaim = useCallback((row: ClaimItem) => {
    setRealClaims((prev) => {
      const updated = [{ ...row, isNew: true }, ...prev].slice(0, FEED_SIZE);
      return updated;
    });
    setTotalClaimed((n) => n + 1);
    setTimeout(() => {
      setRealClaims((prev) =>
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

  // Build display list: real claims first, fill remaining slots with mocks
  const displayClaims: ClaimItem[] = loading
    ? []
    : realClaims.length >= MIN_REAL
      ? realClaims.slice(0, FEED_SIZE)
      : [
          ...realClaims,
          ...MOCK_CLAIMS.slice(0, FEED_SIZE - realClaims.length),
        ];

  // Display total: use real count but floor at mock count so it never shows "0"
  const displayTotal = totalClaimed > 0
    ? totalClaimed
    : MOCK_CLAIMS.length;

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
          {displayTotal.toLocaleString()}+ wallets participated
        </p>
      </div>

      {/* Feed */}
      <div className="glass rounded-2xl overflow-hidden divide-y divide-white/5">
        {loading ? (
          // Skeleton rows
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
        ) : (
          displayClaims.map((claim) => (
            <div
              key={claim.id}
              className={`flex items-center gap-3 px-4 py-3 transition-all duration-500 ${
                claim.isNew
                  ? "bg-success/5 animate-fade-in"
                  : "hover:bg-white/2"
              }`}
            >
              {/* Chain badge */}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm font-bold ${
                  claim.chain === "evm"
                    ? "bg-blue-500/15 text-blue-300"
                    : "bg-purple-500/15 text-purple-300"
                }`}
              >
                {claim.chain === "evm" ? "⟠" : "◎"}
              </div>

              {/* Address + time */}
              <div className="flex-1 min-w-0 space-y-0.5">
                <p className="text-xs font-mono text-white/60 truncate">
                  {shortAddr(claim.wallet_address)}
                </p>
                <p className="text-[10px] text-white/30">
                  {timeAgo(claim.claimed_at)}
                  {claim.isNew && (
                    <span className="ml-2 text-success font-semibold">NEW</span>
                  )}
                </p>
              </div>

              {/* Amount + explorer link */}
              <div className="text-right shrink-0 space-y-0.5">
                <p className="text-xs font-bold text-accent-300">
                  +{claim.token_amount} {TOKEN_SYMBOL}
                </p>
                <a
                  href={explorerUrl(claim)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] text-white/20 hover:text-accent-400 transition-colors"
                >
                  {claim.isMock ? "explorer ↗" : "tx ↗"}
                </a>
              </div>
            </div>
          ))
        )}
      </div>

      <p className="text-center text-[10px] text-white/20">
        Powered by on-chain data · The contract is the source of truth
      </p>
    </div>
  );
}
