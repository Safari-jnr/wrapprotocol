"use client";

// Loaded exclusively via next/dynamic ssr:false in Web3Providers.tsx.
// Nothing in this file runs on the server.

import { useState } from "react";
import { WagmiProvider as WagmiProviderBase } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit";
import { base } from "wagmi/chains";

import "@rainbow-me/rainbowkit/styles.css";

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 1000 * 60 * 5 } },
});

export function WagmiProvider({ children }: { children: React.ReactNode }) {
  // Lazy-load wagmiConfig so it's only created once, client-side, on first render.
  // Using useState ensures the factory runs exactly once per app lifecycle.
  const [config] = useState(() => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { wagmiConfig } = require("@/lib/wagmi/config");
    return wagmiConfig;
  });

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
