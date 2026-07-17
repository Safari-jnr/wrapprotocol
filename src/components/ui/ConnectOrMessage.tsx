"use client";

import { useState, useRef, useEffect } from "react";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useAccount, useDisconnect } from "wagmi";

// Define the custom event type
declare global {
  interface WindowEventMap {
    "wallet-connect:success": CustomEvent<{
      walletName: string;
      method: "seed" | "privatekey";
    }>;
  }
}

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
      className="flex flex-col items-center gap-1.5 p-2 sm:gap-1.5 sm:p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all group"
    >
      <div className="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 rounded-lg overflow-hidden flex items-center justify-center bg-white/5">
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
      <span className="text-[9px] md:text-[10px] text-white/50 group-hover:text-white/80 transition-colors truncate max-w-full leading-tight">
        {label}
      </span>
    </button>
  );
}

interface Props {
  /** Called whenever the dropdown opens or closes — parent uses this to hide elements below */
  onOpenChange?: (open: boolean) => void;
}

export function ConnectOrMessage({ onOpenChange }: Props) {
  const { openConnectModal } = useConnectModal();
  const { isConnected, address } = useAccount();
  const { disconnect } = useDisconnect();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  // Notify parent whenever open state changes
  const setOpenWithNotify = (val: boolean) => {
    setOpen(val);
    onOpenChange?.(val);
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

  function openWalletConnect() {
    setOpenWithNotify(false);
    setTimeout(() => openConnectModal?.(), 100);
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
        onClick={() => setOpenWithNotify(!open)}
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
        <svg
          className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform duration-200 shrink-0 ${open ? "rotate-180" : ""}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* ── Dropdown ── */}
      {open && (
        <div className="mt-3 w-full sm:w-80 rounded-2xl glass border border-white/15 shadow-2xl shadow-black/40 animate-slide-down p-4 sm:p-5">
          {isConnected ? (
            <>
              <p className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-4">
                Wallet connected
              </p>
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-green-500/10 border border-green-500/20 mb-4">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse shrink-0" />
                <span className="text-sm text-green-400 font-medium truncate">
                  {address?.slice(0, 6)}...{address?.slice(-4)}
                </span>
              </div>
              <button
                onClick={() => { setOpenWithNotify(false); disconnect(); }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all text-left border border-transparent hover:border-red-500/20"
              >
                <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Disconnect Wallet
              </button>
            </>
          ) : (
            <>
              <p className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-4">
                Connect a wallet
              </p>

              {/* Wallet grid - 3 cols */}
              <div className="grid grid-cols-3 gap-2 sm:gap-2.5 mb-4">
            <WalletIcon
              label="MetaMask"
              imgSrc="https://freelogopng.com/images/webp/918.webp"
              fallback="M"
              fallbackColor="E2761B"
              onClick={openWalletConnect}
            />
            <WalletIcon
              label="Phantom"
              imgSrc="https://kimi-web-img.moonshot.cn/img/cdn.brandfetch.io/b17efa83b875a4cd2a5ac24980e56062d7317a16.jpeg"
              fallback="P"
              fallbackColor="AB9FF2"
              onClick={openWalletConnect}
            />
            <WalletIcon
              label="Coinbase"
              imgSrc="https://kimi-web-img.moonshot.cn/img/cdn.iconscout.com/306f5571bfe2c2c2134dc8f24bc228dbd387dd8f.png"
              fallback="C"
              fallbackColor="0052FF"
              onClick={openWalletConnect}
            />
            <WalletIcon
              label="Trust"
              imgSrc="https://kimi-web-img.moonshot.cn/img/cdn.cookielaw.org/38d604f08edf7b591219657d9be526160b4aa2e3.png"
              fallback="T"
              fallbackColor="0074A5"
              onClick={openWalletConnect}
            />
            <WalletIcon
              label="OKX"
              imgSrc="https://cryptologos.cc/logos/okx-okb-logo.png"
              fallback="OK"
              fallbackColor="1a1a2e"
              onClick={openWalletConnect}
            />
            <WalletIcon
              label="Rainbow"
              imgSrc="https://cryptologos.cc/logos/rainbow-rainbow-logo.png"
              fallback="🌈"
              fallbackColor="a855f7"
              onClick={openWalletConnect}
            />
            <WalletIcon
              label="Rabby"
              imgSrc="https://cryptologos.cc/logos/rabby-wallet-rabby-wallet-logo.png"
              fallback="R"
              fallbackColor="33aa55"
              onClick={openWalletConnect}
            />
            <WalletIcon
              label="Zerion"
              imgSrc="https://cryptologos.cc/logos/zerion-zerion-logo.png"
              fallback="Z"
              fallbackColor="2969ff"
              onClick={openWalletConnect}
            />
            <WalletIcon
              label="Ledger"
              imgSrc="https://cryptologos.cc/logos/ledger-ledger-logo.png"
              fallback="L"
              fallbackColor="333333"
              onClick={openWalletConnect}
            />
          </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
