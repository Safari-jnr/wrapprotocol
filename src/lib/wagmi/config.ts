"use client";

import {
  getDefaultConfig,
} from "@rainbow-me/rainbowkit";
import {
  metaMaskWallet,
  coinbaseWallet,
  trustWallet,
  okxWallet,
  rainbowWallet,
  rabbyWallet,
  zerionWallet,
  ledgerWallet,
  walletConnectWallet,
  safeWallet,
  braveWallet,
  imTokenWallet,
  bitgetWallet,
} from "@rainbow-me/rainbowkit/wallets";
import { createConfig, http } from "wagmi";
import { mainnet, base, bsc } from "wagmi/chains";
import { connectorsForWallets } from "@rainbow-me/rainbowkit";

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "";
const appName = "MORK Protocol";

// Build connectors — always include WalletConnect when projectId exists
const connectors = connectorsForWallets(
  [
    {
      groupName: "Popular",
      wallets: [
        metaMaskWallet,
        trustWallet,
        coinbaseWallet,
        rabbyWallet,
        rainbowWallet,
      ],
    },
    {
      groupName: "More Wallets",
      wallets: [
        okxWallet,
        bitgetWallet,
        braveWallet,
        zerionWallet,
        imTokenWallet,
        safeWallet,
        ledgerWallet,
        walletConnectWallet,
      ],
    },
  ],
  { appName, projectId: projectId || "fallback" }
);

// ── Lazy singleton ────────────────────────────────────────────────────────────
// createConfig() is called once on the client. The module-level `let` ensures
// it is never called twice, which prevents the WalletConnect double-init warning.
let _config: ReturnType<typeof createConfig> | null = null;

function makeConfig() {
  if (_config) return _config;

  _config = createConfig({
    connectors,
    chains: [base, mainnet, bsc],
    transports: {
      [base.id]: http(process.env.NEXT_PUBLIC_BASE_RPC_URL || "https://mainnet.base.org"),
      [mainnet.id]: http(process.env.NEXT_PUBLIC_ETH_RPC_URL || "https://eth.llamarpc.com"),
      [bsc.id]: http(process.env.NEXT_PUBLIC_BNB_RPC_URL || "https://bsc-dataseed.binance.org"),
    },
    ssr: true,
  });

  return _config;
}

export const wagmiConfig = makeConfig();
