"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useAccount, useDisconnect } from "wagmi";
import { PROJECT_NAME } from "@/lib/constants";
import { usePathname } from "next/navigation";
import { WalletModal } from "./WalletModal";

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [walletConnected, setWalletConnected] = useState<string | null>(null);
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

  const navLinks = [
    { href: "/", label: "Discover" },
    { href: "/#categories", label: "Categories" },
    { href: "/#airdrop", label: "Airdrop" },
  ];

  function handleConnected(addr: string) {
    if (addr) setWalletConnected(addr);
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
          <div className="flex items-center gap-2 sm:gap-3">
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
