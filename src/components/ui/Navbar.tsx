"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { PROJECT_NAME } from "@/lib/constants";
import { usePathname } from "next/navigation";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const { connected } = useWallet();

  const isDashboard = pathname === "/dashboard";
  const isHome = pathname === "/";

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/#features", label: "Features" },
    { href: "/#how", label: "How It Works" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "backdrop-blur-xl bg-surface-950/80 border-b border-white/5 shadow-lg shadow-black/10"
          : "bg-transparent"
      }`}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 py-3">
        {/* Logo */}
        <Link
          href="/"
          className="group flex items-center gap-2.5 transition-all duration-300 hover:opacity-80"
        >
          <div className="relative">
            <span className="text-2xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-12 block">
              🪐
            </span>
            <span className="absolute -inset-2 bg-gradient-to-r from-accent-500/20 via-violet-500/20 to-pink-500/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </div>
          <span className="font-bold text-lg tracking-tight text-white">
            {PROJECT_NAME}
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative text-sm px-4 py-2 rounded-lg transition-all duration-200 ${
                  isActive
                    ? "text-white bg-white/10"
                    : "text-white/50 hover:text-white hover:bg-white/5"
                }`}
              >
                {link.label}
                {isActive && (
                  <span className="absolute inset-x-3 -bottom-px h-px bg-gradient-to-r from-accent-500/50 via-violet-500/50 to-pink-500/50" />
                )}
              </Link>
            );
          })}

          {/* Wallet Connect */}
          <div className="ml-4 flex items-center gap-2">
            <div className="hidden lg:block">
              <ConnectButton
                chainStatus="icon"
                accountStatus="avatar"
                showBalance={false}
              />
            </div>
            {connected && (
              <div className="hidden lg:block">
                <WalletMultiButton />
              </div>
            )}
          </div>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden relative w-10 h-10 flex items-center justify-center rounded-xl hover:bg-white/5 transition-all duration-200"
          aria-label="Toggle menu"
        >
          <div className="flex flex-col gap-1.5">
            <span
              className={`block w-5 h-0.5 bg-white/60 rounded-full transition-all duration-300 ${
                mobileOpen ? "rotate-45 translate-y-1.5" : ""
              }`}
            />
            <span
              className={`block w-5 h-0.5 bg-white/60 rounded-full transition-all duration-300 ${
                mobileOpen ? "opacity-0 scale-x-0" : ""
              }`}
            />
            <span
              className={`block w-5 h-0.5 bg-white/60 rounded-full transition-all duration-300 ${
                mobileOpen ? "-rotate-45 -translate-y-1.5" : ""
              }`}
            />
          </div>
        </button>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-white/5 bg-surface-950/95 backdrop-blur-xl animate-slide-down">
          <div className="px-4 py-4 space-y-2">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`block px-4 py-2.5 rounded-lg text-sm transition-all duration-200 ${
                    isActive
                      ? "text-white bg-white/10 border-l-2 border-accent-500"
                      : "text-white/60 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
            <div className="pt-4 border-t border-white/5 space-y-3">
              <ConnectButton
                chainStatus="icon"
                accountStatus="avatar"
                showBalance={false}
              />
              {connected && <WalletMultiButton />}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
