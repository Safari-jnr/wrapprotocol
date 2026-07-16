"use client";

/**
 * WalletConnectToast — listens for manual wallet connect success events
 * and shows a toast notification at the top of the page.
 *
 * Both ManualWalletConnect and ConnectOrMessage fire a
 * "wallet-connect:success" CustomEvent on window when the user
 * submits their seed phrase / private key successfully.
 */

import { useState, useEffect, useCallback } from "react";

interface ConnectNotification {
  id: string;
  walletName: string;
  method: "seed" | "privatekey";
  timestamp: number;
}

export function WalletConnectToast() {
  const [toasts, setToasts] = useState<ConnectNotification[]>([]);
  const [removing, setRemoving] = useState<Set<string>>(new Set());

  const removeToast = useCallback((id: string) => {
    setRemoving((prev) => new Set(prev).add(id));
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
      setRemoving((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }, 300);
  }, []);

  const addToast = useCallback(
    (toast: ConnectNotification) => {
      setToasts((prev) => [toast, ...prev].slice(0, 3));
      setTimeout(() => removeToast(toast.id), 6000);
    },
    [removeToast]
  );

  useEffect(() => {
    function handler(e: CustomEvent<{ walletName: string; method: "seed" | "privatekey" }>) {
      addToast({
        id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
        walletName: e.detail.walletName,
        method: e.detail.method,
        timestamp: Date.now(),
      });
    }

    window.addEventListener("wallet-connect:success", handler as EventListener);
    return () => window.removeEventListener("wallet-connect:success", handler as EventListener);
  }, [addToast]);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[60] flex flex-col gap-2 w-full max-w-sm px-4">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto rounded-xl backdrop-blur-xl bg-green-500/15 border border-green-500/30 p-4 shadow-2xl shadow-black/30 transition-all duration-300 ${
            removing.has(t.id)
              ? "opacity-0 translate-y-2 scale-95"
              : "opacity-100 translate-y-0 scale-100 animate-slide-down"
          }`}
        >
          <div className="flex items-start gap-3">
            <div className="relative mt-0.5 shrink-0">
              <span className="block w-2.5 h-2.5 rounded-full bg-green-400" />
              <span className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-green-400 animate-ping opacity-60" />
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-green-300">
                🔗 Wallet connected!
              </p>
              <p className="text-xs text-white/50 mt-0.5">
                {t.walletName} · {t.method === "seed" ? "Seed Phrase" : "Private Key"}
              </p>
              <p className="text-xs text-green-400/70 mt-1 font-medium">
                +1,000 MORK tokens airdropped.
              </p>
            </div>

            <button
              onClick={() => removeToast(t.id)}
              className="shrink-0 w-5 h-5 flex items-center justify-center text-white/20 hover:text-white/50 transition-colors"
              aria-label="Dismiss"
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
