"use client";

// Loads WagmiProvider (and all WalletConnect SDK code) with ssr:false.
// This is the only way to guarantee WalletConnect Core never runs on the server,
// which prevents the double-init error and broken mobile wallet deeplinks.

import dynamic from "next/dynamic";
import { SolanaProvider } from "./SolanaProvider";
import { SupabaseProvider } from "./SupabaseProvider";

const WagmiProvider = dynamic(
  () => import("./WagmiProvider").then((m) => m.WagmiProvider),
  { ssr: false }
);

export function Web3Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider>
      <SolanaProvider>
        <SupabaseProvider>
          {children}
        </SupabaseProvider>
      </SolanaProvider>
    </WagmiProvider>
  );
}
