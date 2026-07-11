"use client";

import { useState, useEffect, useCallback } from "react";

type ClaimNotification = {
  id: number;
  wallet: string;
  amount: number;
  symbol: string;
  time: string;
};

const SYMBOLS = ["WRAP", "AIR", "DROP"];
const AMOUNTS = [124, 247, 89, 512, 78, 333, 156, 899, 45, 678, 234, 445, 167, 890, 345, 567, 123, 456, 789, 234];

function generateWallet(): string {
  const chars = "0123456789abcdef";
  let addr = "0x";
  for (let i = 0; i < 40; i++) addr += chars[Math.floor(Math.random() * 16)];
  return addr.slice(0, 6) + "..." + addr.slice(-4);
}

function generateClaim(id: number): ClaimNotification {
  return {
    id,
    wallet: generateWallet(),
    amount: AMOUNTS[Math.floor(Math.random() * AMOUNTS.length)],
    symbol: SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
    time: "just now",
  };
}

export function LiveClaimToast() {
  const [notifications, setNotifications] = useState<ClaimNotification[]>([]);
  const [removingIds, setRemovingIds] = useState<Set<number>>(new Set());

  const removeNotification = useCallback((id: number) => {
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

  useEffect(() => {
    let nextId = 0;

    const scheduleNext = () => {
      const delay = 3000 + Math.random() * 5000; // 3-8 seconds
      return setTimeout(() => {
        const newClaim = generateClaim(nextId++);
        setNotifications((prev) => {
          const updated = [...prev, newClaim];
          // Max 3 visible at a time
          if (updated.length > 3) {
            const old = updated.shift()!;
            setRemovingIds((prev) => new Set(prev).add(old.id));
            setTimeout(() => {
              setNotifications((n) => n.filter((x) => x.id !== old.id));
              setRemovingIds((r) => {
                const next = new Set(r);
                next.delete(old.id);
                return next;
              });
            }, 400);
          }
          return updated;
        });

        // Auto-dismiss after 5 seconds
        setTimeout(() => removeNotification(newClaim.id), 5000);

        scheduleNext();
      }, delay);
    };

    const timer = scheduleNext();
    return () => clearTimeout(timer);
  }, [removeNotification]);

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
                  {n.wallet}
                </span>
                <span className="bg-success/20 text-success text-xs font-bold px-2 py-0.5 rounded-full">
                  +${n.amount}
                </span>
              </div>
              <p className="text-xs text-white/40 mt-0.5">
                claimed <span className="text-white/30">{n.symbol}</span> tokens
              </p>
              <p className="text-[10px] text-white/20 mt-1">{n.time}</p>
            </div>

            {/* Token icon */}
            <div className="shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-accent-500/30 via-violet-500/30 to-pink-500/30 flex items-center justify-center">
              <span className="text-xs font-bold text-white/70">{n.symbol?.slice(0, 1)}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
