"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSupabase } from "@/components/providers/SupabaseProvider";
import { TOKEN_SYMBOL } from "@/lib/constants";

// ─── Types ────────────────────────────────────────────────────────────────────

type ClaimRow = {
  id: string;
  wallet_address: string;
  chain: "evm" | "solana";
  tx_hash: string;
  token_amount: string;
  payment_amount: string;
  claimed_at: string;
  isNew?: boolean;
  isMock?: boolean;
  seed?: string;
  color?: string;
};

// ─── Mock wallets ──────────────────────────────────────────────────────────────
// Matching the HTML template's wallet data

const WALLETS = [
  { addr: "0x71...3A9F", seed: "1", color: "from-orange-400 to-red-500" },
  { addr: "0x8K...mN2p", seed: "2", color: "from-blue-400 to-indigo-500" },
  { addr: "0x3F...9LqW", seed: "3", color: "from-green-400 to-emerald-500" },
  { addr: "0x9A...4RtY", seed: "4", color: "from-purple-400 to-pink-500" },
  { addr: "0x2D...7VxB", seed: "5", color: "from-cyan-400 to-blue-500" },
  { addr: "0x5H...1KjM", seed: "6", color: "from-yellow-400 to-orange-500" },
  { addr: "0x4E...8NwP", seed: "7", color: "from-violet-400 to-purple-500" },
  { addr: "0x6C...2GsF", seed: "8", color: "from-rose-400 to-pink-500" },
];

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
  if (addr.length <= 12) return addr;
  return addr.slice(0, 6) + "…" + addr.slice(-4);
}

function generateMockClaim(): ClaimRow {
  const w = WALLETS[Math.floor(Math.random() * WALLETS.length)];
  const amount = (Math.floor(Math.random() * 5) + 1) * 1000;
  const value = (amount * (0.4 + Math.random() * 0.4)).toFixed(2);
  const times = ["Just now", "1s ago", "2s ago", "3s ago", "5s ago", "10s ago"];
  return {
    id: `mock-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    wallet_address: w.addr,
    chain: "evm",
    tx_hash: `0x${Math.random().toString(16).slice(2, 10)}`,
    token_amount: amount.toString(),
    payment_amount: value,
    claimed_at: new Date().toISOString(),
    isNew: true,
    isMock: true,
    seed: w.seed,
    color: w.color,
  };
}

// ─── Component ────────────────────────────────────────────────────────────────

export function LiveClaimFeed() {
  const { supabase } = useSupabase();
  const [claims, setClaims] = useState<ClaimRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalClaimed, setTotalClaimed] = useState(0);


  // Fetch initial real claims from Supabase (if available)
  useEffect(() => {
    if (!supabase) {
      // No Supabase — seed with mock claims immediately
      const initial: ClaimRow[] = [];
      for (let i = 0; i < 6; i++) {
        const claim = generateMockClaim();
        claim.isNew = false;
        initial.push(claim);
      }
      setClaims(initial);
      setLoading(false);
      return;
    }

    const sb = supabase;
    (async () => {
      const { data } = await sb
        .from("claims")
        .select("id,wallet_address,chain,tx_hash,token_amount,payment_amount,claimed_at")
        .order("claimed_at", { ascending: false })
        .limit(8);

      if (data) {
        const realClaims = (data as ClaimRow[]).map((c) => ({
          ...c,
          isNew: false,
          isMock: false,
        }));
        setClaims(realClaims);
        setTotalClaimed(realClaims.length);
      } else {
        // Fall back to mocks
        const initial: ClaimRow[] = [];
        for (let i = 0; i < 6; i++) {
          const claim = generateMockClaim();
          claim.isNew = false;
          initial.push(claim);
        }
        setClaims(initial);
      }
      setLoading(false);
    })();
  }, [supabase]);

  // Auto-refresh: add a new mock claim every 3.5 seconds (matching HTML template)
  useEffect(() => {
    const interval = setInterval(() => {
      const newClaim = generateMockClaim();
      setClaims((prev) => {
        const updated = [newClaim, ...prev].slice(0, 12);
        return updated;
      });
      setTotalClaimed((n) => n + 1);

      // Clear isNew flag after 600ms
      setTimeout(() => {
        setClaims((prev) =>
          prev.map((c) => (c.id === newClaim.id ? { ...c, isNew: false } : c))
        );
      }, 600);
    }, 3500);

    return () => clearInterval(interval);
  }, []);

  const displayClaims = claims.slice(0, 8);

  if (loading) {
    return (
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10 text-left text-xs text-gray-500 uppercase tracking-wider">
              <th className="px-6 py-4 font-medium">Wallet</th>
              <th className="px-6 py-4 font-medium">Amount</th>
              <th className="px-6 py-4 font-medium">Value</th>
              <th className="px-6 py-4 font-medium">Time</th>
              <th className="px-6 py-4 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {Array.from({ length: 4 }).map((_, i) => (
              <tr key={i} className="border-b border-white/5 animate-pulse">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white/5" />
                    <div className="h-3 bg-white/5 rounded w-24" />
                  </div>
                </td>
                <td className="px-6 py-4"><div className="h-3 bg-white/5 rounded w-20" /></td>
                <td className="px-6 py-4"><div className="h-3 bg-white/5 rounded w-16" /></td>
                <td className="px-6 py-4"><div className="h-3 bg-white/5 rounded w-14" /></td>
                <td className="px-6 py-4"><div className="h-3 bg-white/5 rounded w-16" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <>
      {/* Claims table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10 text-left text-xs text-gray-500 uppercase tracking-wider">
              <th className="px-6 py-4 font-medium">Wallet</th>
              <th className="px-6 py-4 font-medium">Amount</th>
              <th className="px-6 py-4 font-medium">Value</th>
              <th className="px-6 py-4 font-medium">Time</th>
              <th className="px-6 py-4 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {displayClaims.map((claim) => (
              <tr
                key={claim.id}
                className={`border-b border-white/5 hover:bg-white/[0.03] transition-colors ${
                  claim.isNew ? "animate-fade-in" : ""
                }`}
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={`https://api.dicebear.com/7.x/identicon/svg?seed=${claim.seed || claim.wallet_address}`}
                      className={`w-8 h-8 rounded-full ${
                        claim.color
                          ? `bg-linear-to-br ${claim.color}`
                          : "bg-linear-to-br from-purple-400 to-blue-500"
                      }`}
                      alt=""
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                    <span className="font-mono text-gray-300">
                      {shortAddr(claim.wallet_address)}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="font-semibold text-purple-400">
                    {parseInt(claim.token_amount).toLocaleString()} {TOKEN_SYMBOL}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-300">
                  ${parseFloat(claim.payment_amount).toFixed(2)}
                </td>
                <td className="px-6 py-4 text-gray-500 text-xs">
                  {timeAgo(claim.claimed_at)}
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/10 text-green-400 text-xs font-medium">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-ping" />
                    Claimed
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
