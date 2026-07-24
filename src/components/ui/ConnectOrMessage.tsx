"use client";

import { useState, useRef, useEffect } from "react";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useAccount, useDisconnect, useConnect } from "wagmi";

interface Props {
  onOpenChange?: (open: boolean) => void;
}

export function ConnectOrMessage({ onOpenChange }: Props) {
  const { openConnectModal } = useConnectModal();
  const { isConnected, address } = useAccount();
  const { disconnect } = useDisconnect();
  const { connect, connectors } = useConnect();
  const [open, setOpen] = useState(false);
  const [showMsg, setShowMsg] = useState(false);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [msgState, setMsgState] = useState<"idle"|"loading"|"sent"|"error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const setOpenWithNotify = (val: boolean) => {
    setOpen(val);
    onOpenChange?.(val);
    if (!val) setShowMsg(false);
  };

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpenWithNotify(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim()) return;
    setMsgState("loading");
    setErrorMsg("");
    try {
      const res = await fetch("/api/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), message: message.trim() }),
      });
      if (!res.ok) throw new Error("Failed");
      setMsgState("sent");
      setName("");
      setMessage("");
    } catch {
      setMsgState("error");
      setErrorMsg("Failed to send. Try again.");
    }
  }

  // Find connector by name fragment (case-insensitive)
  function findConnector(nameFragment: string) {
    return connectors.find(c =>
      c.name.toLowerCase().includes(nameFragment.toLowerCase())
    );
  }

  // On mobile: directly trigger WalletConnect which shows the deeplink picker
  // On desktop: open RainbowKit modal
  function handleWalletClick(walletName: string) {
    setOpenWithNotify(false);
    const isMobile = window.matchMedia("(pointer: coarse)").matches;
    if (isMobile) {
      // WalletConnect handles all mobile wallets — MetaMask, Trust, OKX etc
      // via the deeplink picker / universal link
      const wc = connectors.find(c =>
        c.name.toLowerCase().includes("walletconnect") ||
        c.id.toLowerCase().includes("walletconnect")
      );
      if (wc) {
        connect({ connector: wc });
        return;
      }
      // If no WC connector, try the specific wallet
      const specific = findConnector(walletName);
      if (specific) { connect({ connector: specific }); return; }
    }
    openConnectModal?.();
  }

  if (!mounted) {
    return (
      <button className="inline-flex items-center justify-center gap-2 rounded-full bg-white/10 border border-white/25 px-6 sm:px-10 py-3 sm:py-4 text-base sm:text-lg font-bold text-white opacity-80">
        Connect Wallet
        <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
      </button>
    );
  }

  return (
    <div ref={ref} className="relative inline-flex flex-col items-center w-full max-w-sm sm:max-w-none">
      {/* ── Main button ── */}
      <button
        onClick={() => {
          if (!isConnected && window.matchMedia("(pointer: coarse)").matches) {
            // Mobile: directly trigger WalletConnect — shows deeplink picker for all wallets
            const wc = connectors.find(c =>
              c.name.toLowerCase().includes("walletconnect") ||
              c.id.toLowerCase().includes("walletconnect")
            );
            if (wc) { connect({ connector: wc }); return; }
            // No WC connector — open modal as fallback
            openConnectModal?.();
            return;
          }
          setOpenWithNotify(!open);
        }}
        className={`group inline-flex items-center justify-center gap-2 rounded-full border px-5 sm:px-10 py-2.5 sm:py-4 text-sm sm:text-lg font-bold transition-all duration-300 hover:scale-105 hover:shadow-2xl w-full sm:w-auto ${
          isConnected
            ? "bg-success/15 border-success/30 text-success hover:bg-success/20 hover:shadow-success/20"
            : "bg-white/10 border-white/25 text-white hover:bg-white/15 hover:border-white/40"
        }`}
      >
        <svg className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3" />
        </svg>
        {isConnected ? "✓ Wallet Connected" : "Connect Wallet"}
        <svg className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform duration-200 shrink-0 ${open ? "rotate-180" : ""}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* ── Dropdown ── */}
      {open && (
        <div className="mt-3 w-full sm:w-80 rounded-2xl glass border border-white/15 shadow-2xl shadow-black/40 animate-slide-down overflow-hidden">
          {isConnected ? (
            <div className="p-4 sm:p-5">
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-green-500/10 border border-green-500/20 mb-3">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse shrink-0" />
                <span className="text-sm text-green-400 font-medium truncate">
                  {address?.slice(0, 6)}...{address?.slice(-4)}
                </span>
              </div>
              <button
                onClick={() => { setOpenWithNotify(false); disconnect(); }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all text-left"
              >
                <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Disconnect
              </button>
              <div className="h-px bg-white/8 my-2" />
              <button
                onClick={() => setShowMsg(!showMsg)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-white/60 hover:text-white hover:bg-white/8 transition-all text-left"
              >
                <svg className="w-4 h-4 shrink-0 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
                Message Owner
              </button>
            </div>
          ) : (
            <div className="p-4 sm:p-5">
              <p className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3">
                Choose wallet
              </p>
              {/* Wallet list — each button connects directly */}
              <div className="space-y-1">
                {[
                  { name: "MetaMask",   fragment: "metamask",    icon: "🦊", color: "bg-orange-500/10 border-orange-500/20 text-orange-300" },
                  { name: "Trust Wallet", fragment: "trust",     icon: "🛡", color: "bg-blue-500/10 border-blue-500/20 text-blue-300" },
                  { name: "Coinbase",   fragment: "coinbase",    icon: "🔵", color: "bg-blue-600/10 border-blue-600/20 text-blue-400" },
                  { name: "OKX",        fragment: "okx",         icon: "⬛", color: "bg-white/5 border-white/10 text-white/70" },
                  { name: "Rainbow",    fragment: "rainbow",     icon: "🌈", color: "bg-purple-500/10 border-purple-500/20 text-purple-300" },
                  { name: "Rabby",      fragment: "rabby",       icon: "🐰", color: "bg-green-500/10 border-green-500/20 text-green-300" },
                  { name: "WalletConnect (QR)", fragment: "walletconnect", icon: "📱", color: "bg-blue-400/10 border-blue-400/20 text-blue-300" },
                ].map((w) => (
                  <button
                    key={w.name}
                    onClick={() => handleWalletClick(w.fragment)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium border transition-all hover:scale-[1.01] text-left ${w.color}`}
                  >
                    <span className="text-lg shrink-0">{w.icon}</span>
                    <span>{w.name}</span>
                  </button>
                ))}
              </div>
              <div className="h-px bg-white/8 my-3" />
              <button
                onClick={() => setShowMsg(true)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-white/50 hover:text-white hover:bg-white/8 transition-all text-left"
              >
                <svg className="w-4 h-4 shrink-0 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
                Message Owner
              </button>
            </div>
          )}

          {/* ── Message form ── */}
          {showMsg && (
            <div className="border-t border-white/10 p-4 sm:p-5 space-y-3">
              <div className="flex items-center justify-between">
                <p className="font-bold text-white text-sm">Message the Owner</p>
                <button onClick={() => setShowMsg(false)} className="text-white/30 hover:text-white/60 p-1">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              {msgState === "sent" ? (
                <div className="text-center py-4 space-y-2">
                  <p className="text-2xl">✉️</p>
                  <p className="text-sm text-green-400 font-semibold">Message sent!</p>
                  <button onClick={() => { setShowMsg(false); setMsgState("idle"); }} className="text-xs text-white/30 hover:text-white/50 underline">Close</button>
                </div>
              ) : (
                <form onSubmit={handleSendMessage} className="space-y-3">
                  <input type="text" placeholder="Your name (optional)" value={name} onChange={e => setName(e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/25 focus:border-accent-500/50 focus:outline-none" />
                  <textarea placeholder="Write your message…" value={message} onChange={e => setMessage(e.target.value)} rows={3} required
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/25 focus:border-accent-500/50 focus:outline-none resize-none" />
                  <button type="submit" disabled={msgState === "loading" || !message.trim()}
                    className="w-full rounded-lg bg-linear-to-r from-accent-500 via-violet-500 to-pink-500 py-2.5 text-sm font-bold text-white hover:opacity-90 disabled:opacity-50 transition-opacity">
                    {msgState === "loading" ? "Sending…" : "Send Message"}
                  </button>
                  {msgState === "error" && <p className="text-xs text-red-400 text-center">{errorMsg}</p>}
                </form>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
