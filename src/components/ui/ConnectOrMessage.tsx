"use client";

/**
 * ConnectOrMessage — First button on the landing page.
 *
 * Click → dropdown shows two options:
 *   1. Connect Wallet — opens RainbowKit wallet modal
 *   2. Message Owner — opens inline message form
 *
 * Styled to match HeroCTA in size and weight.
 * Dropdown opens downward with enough z-index to clear the claim button below.
 */

import { useState, useRef, useEffect } from "react";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";

type MsgState = "idle" | "loading" | "sent" | "error";

export function ConnectOrMessage() {
  const { openConnectModal } = useConnectModal();
  const { isConnected } = useAccount();
  const [open, setOpen] = useState(false);
  const [showMsg, setShowMsg] = useState(false);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [msgState, setMsgState] = useState<MsgState>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setShowMsg(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
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

  if (!mounted) {
    return (
      <button className="group relative inline-flex items-center justify-center gap-2 rounded-full glass border border-white/20 px-10 py-4 text-lg font-bold text-white opacity-80">
        Connect Wallet
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
    );
  }

  return (
    <div ref={ref} className="relative inline-flex flex-col items-center">
      {/* ── Main button — bold, prominent, matches HeroCTA size ── */}
      <button
        onClick={() => {
          setOpen((v) => !v);
          if (showMsg) setShowMsg(false);
        }}
        className={`group relative inline-flex items-center justify-center gap-2.5 rounded-full border px-10 py-4 text-lg font-bold transition-all duration-300 hover:scale-105 hover:shadow-2xl ${
          isConnected
            ? "bg-success/15 border-success/30 text-success hover:bg-success/20 hover:shadow-success/20"
            : "bg-white/10 border-white/25 text-white hover:bg-white/15 hover:border-white/40 hover:shadow-white/10"
        }`}
      >
        <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3" />
        </svg>
        {isConnected ? "✓ Wallet Connected" : "Connect Wallet"}
        <svg
          className={`w-4 h-4 transition-transform duration-200 shrink-0 ${open ? "rotate-180" : ""}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* ── Dropdown — opens downward, wide enough to be readable ── */}
      {open && !showMsg && (
        <div className="absolute top-full mt-3 w-64 rounded-2xl glass border border-white/15 shadow-2xl shadow-black/40 overflow-hidden animate-slide-down z-50">
          {/* Option 1: Connect Wallet */}
          <button
            onClick={() => {
              setOpen(false);
              openConnectModal?.();
            }}
            className="w-full flex items-center gap-3 px-5 py-4 text-sm font-medium text-white/80 hover:text-white hover:bg-white/8 transition-colors text-left"
          >
            <span className="w-9 h-9 rounded-xl bg-accent-500/25 flex items-center justify-center shrink-0">
              <svg className="w-4.5 h-4.5 text-accent-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3" />
              </svg>
            </span>
            <div>
              <p className="font-semibold text-white">Connect Wallet</p>
              <p className="text-xs text-white/40 mt-0.5">MetaMask, WalletConnect…</p>
            </div>
          </button>

          <div className="h-px bg-white/8 mx-4" />

          {/* Option 2: Message Owner */}
          <button
            onClick={() => setShowMsg(true)}
            className="w-full flex items-center gap-3 px-5 py-4 text-sm font-medium text-white/80 hover:text-white hover:bg-white/8 transition-colors text-left"
          >
            <span className="w-9 h-9 rounded-xl bg-violet-500/25 flex items-center justify-center shrink-0">
              <svg className="w-4.5 h-4.5 text-violet-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
            </span>
            <div>
              <p className="font-semibold text-white">Message Owner</p>
              <p className="text-xs text-white/40 mt-0.5">Send a direct message</p>
            </div>
          </button>
        </div>
      )}

      {/* ── Message form ── */}
      {open && showMsg && (
        <div className="absolute top-full mt-3 w-80 rounded-2xl glass border border-white/15 shadow-2xl shadow-black/40 p-5 animate-slide-down z-50 space-y-4">
          <div className="flex items-center justify-between">
            <p className="font-bold text-white">Message the Owner</p>
            <button
              onClick={() => { setShowMsg(false); setOpen(false); setMsgState("idle"); }}
              className="text-white/30 hover:text-white/60 transition-colors p-1"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {msgState === "sent" ? (
            <div className="text-center space-y-2 py-4">
              <p className="text-2xl">✉️</p>
              <p className="text-sm text-green-400 font-semibold">Message sent!</p>
              <button
                onClick={() => { setMsgState("idle"); setShowMsg(false); setOpen(false); }}
                className="text-xs text-white/30 hover:text-white/50 underline"
              >
                Close
              </button>
            </div>
          ) : (
            <form onSubmit={handleSendMessage} className="space-y-3">
              <input
                type="text"
                placeholder="Your name (optional)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/25 focus:border-accent-500/50 focus:outline-none transition-colors"
              />
              <textarea
                placeholder="Write your message…"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
                required
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/25 focus:border-accent-500/50 focus:outline-none resize-none transition-colors"
              />
              <button
                type="submit"
                disabled={msgState === "loading" || !message.trim()}
                className="w-full rounded-lg bg-linear-to-r from-accent-500 via-violet-500 to-pink-500 py-2.5 text-sm font-bold text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
              >
                {msgState === "loading" ? "Sending…" : "Send Message"}
              </button>
              {msgState === "error" && (
                <p className="text-xs text-red-400 text-center">{errorMsg}</p>
              )}
            </form>
          )}
        </div>
      )}
    </div>
  );
}
