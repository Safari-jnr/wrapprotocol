"use client";

import { useAccount } from "wagmi";
import { useWallet } from "@solana/wallet-adapter-react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import Link from "next/link";

const WalletMultiButton = dynamic(
  () =>
    import("@solana/wallet-adapter-react-ui").then((m) => m.WalletMultiButton),
  { ssr: false }
);

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Overview",
  "/dashboard/explores": "Explore",
  "/dashboard/claim": "Claim MORK",
  "/dashboard/defi": "DeFi Opportunities",
  "/dashboard/portfolio": "Portfolio",
  "/dashboard/history": "Claim History",
};

export function DashboardHeader() {
  const { address, isConnected } = useAccount();
  const { connected } = useWallet();
  const pathname = usePathname();

  const title = PAGE_TITLES[pathname] ?? "Dashboard";

  return (
    <header className="sticky top-0 z-30 flex items-center gap-4 px-4 sm:px-6 lg:px-8 h-16 border-b border-white/5 bg-surface-950/80 backdrop-blur-xl">
      {/* Mobile menu / page title */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {/* Mobile back link */}
        <Link
          href="/"
          className="lg:hidden text-white/30 hover:text-white/60 transition-colors"
          aria-label="Back to home"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
        </Link>
        <h1 className="text-base font-semibold text-white truncate">{title}</h1>
      </div>

      {/* Wallet buttons */}
      <div className="flex items-center gap-2 shrink-0">
        {isConnected && address && (
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/5">
            <span className="w-2 h-2 rounded-full bg-success shrink-0" />
            <span className="font-mono text-xs text-white/60 truncate max-w-[120px]">
              {address.slice(0, 6)}…{address.slice(-4)}
            </span>
          </div>
        )}
        <ConnectButton
          chainStatus="icon"
          accountStatus="avatar"
          showBalance={false}
          label="Connect EVM"
        />
        {connected && (
          <div className="hidden md:block">
            <WalletMultiButton />
          </div>
        )}
      </div>
    </header>
  );
}
