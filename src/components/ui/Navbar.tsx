"use client";

import Link from "next/link";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { PROJECT_NAME } from "@/lib/constants";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-black/80 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <span className="text-2xl">🪐</span>
          <span className="font-bold text-white tracking-tight">
            {PROJECT_NAME}
          </span>
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-2 flex-wrap justify-end">
          <Link
            href="/dashboard"
            className="hidden sm:block text-sm text-white/60 hover:text-white transition-colors px-3 py-1.5"
          >
            Dashboard
          </Link>

          {/* EVM wallet */}
          <ConnectButton
            chainStatus="icon"
            accountStatus="avatar"
            showBalance={false}
            label="EVM"
          />

          {/* Solana wallet */}
          <WalletMultiButton
            style={{
              background: "rgba(124,58,237,0.7)",
              borderRadius: "0.625rem",
              fontSize: "0.8125rem",
              height: "2.25rem",
              padding: "0 0.75rem",
            }}
          />
        </div>
      </nav>
    </header>
  );
}
