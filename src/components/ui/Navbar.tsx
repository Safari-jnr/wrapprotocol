"use client";

import Link from "next/link";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { PROJECT_NAME } from "@/lib/constants";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-black/80 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl">🪐</span>
          <span className="font-bold text-white tracking-tight">
            {PROJECT_NAME}
          </span>
        </Link>

        {/* Right side — connect wallet + dashboard link */}
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="hidden sm:block text-sm text-white/70 hover:text-white transition-colors"
          >
            Dashboard
          </Link>
          <ConnectButton
            chainStatus="icon"
            accountStatus="avatar"
            showBalance={false}
          />
        </div>
      </nav>
    </header>
  );
}
