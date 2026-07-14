"use client";

import { useMemo } from "react";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { SOLANA_NETWORK } from "@/lib/constants";

import "@solana/wallet-adapter-react-ui/styles.css";

export function SolanaProvider({ children }: { children: React.ReactNode }) {
  const endpoint = useMemo(() => {
    const env = process.env.NEXT_PUBLIC_SOLANA_RPC_URL;
    if (env && env.startsWith("http")) return env;
    return "https://api.devnet.solana.com";
  }, []);

  // Empty wallets array — Phantom and Solflare auto-register via Wallet Standard.
  // Passing them explicitly causes "already registered" warnings in the console.
  const wallets = useMemo(() => [], []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
