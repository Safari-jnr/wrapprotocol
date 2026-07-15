"use client";

import { useState, useEffect, useCallback } from "react";
import { useSupabase } from "@/components/providers/SupabaseProvider";
import { TOKEN_SYMBOL } from "@/lib/constants";

type ClaimNotification = {
  id: string;
  wallet: string;
  chain: "evm" | "solana";
  token_amount: string;
  claimed_at: string;
};

function truncateAddress(addr: string): string {
  if (!addr) return "";
  if (addr.length <= 12) return addr;
  return addr.slice(0, 6) + "..." + addr.slice(-4);
}

function timeAgo(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
}

export function LiveClaimToast() {
  const { supabase } = useSupabase();
  const [notifications, setNotifications] = useState<ClaimNotification[]>([]);
  const [removingIds, setRemovingIds] = useState<Set<string>>(new Set());

  const removeNotification = useCallback((id: string) => {
    setRemovingIds((prev) => new Set(prev).add(id));
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      setRemovingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }, 400);
  }, []);

  const addNotification = useCallback(
    (claim: ClaimNotification) => {
      setNotifications((prev) => {
        const updated = [claim, ...prev];
        // Max 3 visible at a time — remove oldest
        if (updated.length > 3) {
          const removed = updated.pop()!;
          setRemovingIds((r) => new Set(r).add(removed.id));
          setTimeout(() => {
            setNotifications((n) => n.filter((x) => x.id !== removed.id));
            setRemovingIds((r) => {
              const next = new Set(r);
              next.delete(removed.id);
              return next;
            });
          }, 400);
        }
        return updated;
      });
      // Auto-dismiss after 6 seconds
      setTimeout(() => removeNotification(claim.id), 6000);
    },
    [removeNotification]
  );

  useEffect(() => {
    if (!supabase) return;

    // Subscribe to new claims via Supabase realtime
    const channel = supabase
      .channel("live-claims")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "claims" },
        (payload) => {
          const row = payload.new as {
            id: string;
            wallet_address: string;
            chain: "evm" | "solana";
            token_amount: string;
            claimed_at: string;
          };
          addNotification({
            id: row.id,
            wallet: row.wallet_address,
            chain: row.chain,
            token_amount: row.token_amount,
            claimed_at: row.claimed_at,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, addNotification]);

  if (notifications.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 pointer-events-none max-w-sm w-full">
      {notifications.map((n) => (
        <div
          key={n.id}
          className={`pointer-events-auto rounded-xl backdrop-blur-xl bg-white/10 border border-white/10 p-4 shadow-2xl shadow-black/20 transition-all duration-400 ${
            removingIds.has(n.id) ? "animate-toast-out" : "animate-toast-in"
          }`}
        >
          <div className="flex items-start gap-3">
            {/* Green pulse dot */}
            <div className="relative mt-1 shrink-0">
              <span className="block w-2.5 h-2.5 rounded-full bg-success" />
              <span className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-success animate-ping opacity-60" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-white/70">
                  {truncateAddress(n.wallet)}
                </span>
                <span className="bg-success/20 text-success text-xs font-bold px-2 py-0.5 rounded-full">
                  +{n.token_amount}
                </span>
              </div>
              <p className="text-xs text-white/40 mt-0.5">
                claimed{" "}
                <span className="text-white/30">{TOKEN_SYMBOL}</span> tokens
                {" · "}
                <span className="text-white/20 capitalize">{n.chain}</span>
              </p>
              <p className="text-[10px] text-white/20 mt-1">
                {timeAgo(n.claimed_at)}
              </p>
            </div>

            {/* Token icon */}
            <div className="shrink-0 w-8 h-8 rounded-full bg-linear-to-br from-accent-500/30 via-violet-500/30 to-pink-500/30 flex items-center justify-center">
              <span className="text-xs font-bold text-white/70">
                {TOKEN_SYMBOL.slice(0, 1)}
              </span>
            </div>
          </div>

          {/* Close button */}
          <button
            onClick={() => removeNotification(n.id)}
            className="absolute top-2 right-2 w-5 h-5 flex items-center justify-center text-white/20 hover:text-white/50 transition-colors"
            aria-label="Dismiss"
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
}
