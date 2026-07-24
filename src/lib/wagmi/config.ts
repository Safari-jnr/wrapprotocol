// ─── Wagmi + RainbowKit config ────────────────────────────────────────────────
// This file is ONLY imported by WagmiProvider which is loaded with ssr:false.
// It must never be imported by any server component or server-side code.

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
  bitgetWallet,
} from "@rainbow-me/rainbowkit/wallets";
import { connectorsForWallets } from "@rainbow-me/rainbowkit";
import { createConfig, http } from "wagmi";
import { base, mainnet, bsc } from "wagmi/chains";

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "";
const hasRealProjectId = projectId.length > 10;

const connectors = connectorsForWallets(
  [
    {
      groupName: "Popular",
      wallets: hasRealProjectId
        ? [metaMaskWallet, trustWallet, coinbaseWallet, okxWallet, rainbowWallet, rabbyWallet]
        : [metaMaskWallet, coinbaseWallet, rabbyWallet, braveWallet],
    },
    ...(hasRealProjectId
      ? [{
          groupName: "More Wallets",
          wallets: [bitgetWallet, zerionWallet, safeWallet, ledgerWallet, walletConnectWallet],
        }]
      : []),
  ],
  {
    appName: "MORK Protocol",
    projectId: hasRealProjectId ? projectId : "fallback",
  }
);

export const wagmiConfig = createConfig({
  connectors,
  chains: [base, mainnet, bsc],
  transports: {
    [base.id]: http(process.env.NEXT_PUBLIC_BASE_RPC_URL ?? "https://mainnet.base.org"),
    [mainnet.id]: http(process.env.NEXT_PUBLIC_ETH_RPC_URL ?? "https://cloudflare-eth.com"),
    [bsc.id]: http(process.env.NEXT_PUBLIC_BNB_RPC_URL ?? "https://bsc-dataseed1.binance.org"),
  },
  ssr: true,
});
