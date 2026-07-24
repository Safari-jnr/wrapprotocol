"use client";

import { useMemo } from "react";
import { WagmiProvider as WagmiProviderBase } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit";
import { getWagmiConfig } from "@/lib/wagmi/config";
import { base } from "wagmi/chains";

import "@rainbow-me/rainbowkit/styles.css";

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 1000 * 60 * 5 } },
});

export function WagmiProvider({ children }: { children: React.ReactNode }) {
  // useMemo ensures getWagmiConfig() is called once per component mount,
  // not at module scope — so WalletConnect Core only initializes client-side.
  const config = useMemo(() => getWagmiConfig(), []);

  return (
    <WagmiProviderBase config={config}>
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
