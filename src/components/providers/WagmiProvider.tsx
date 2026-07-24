"use client";

// ─── WagmiProvider ────────────────────────────────────────────────────────────
// Dynamically imported with ssr:false in Web3Providers.tsx so the WalletConnect
// SDK never runs on the server. This is the ONLY reliable way to prevent the
// "WalletConnect Core initialized 2 times" error and mobile deeplink failures.

import { WagmiProvider as WagmiProviderBase } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit";
import { wagmiConfig } from "@/lib/wagmi/config";
import { base } from "wagmi/chains";

import "@rainbow-me/rainbowkit/styles.css";

// One QueryClient for the app lifetime — outside the component so it's never recreated
const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 1000 * 60 * 5 } },
});

export function WagmiProvider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProviderBase config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          initialChain={base}
          theme={darkTheme({
            accentColor: "#6366f1",
            accentColorForeground: "white",
            borderRadius: "medium",
          })}
          modalSize="compact"
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProviderBase>
  );
}
