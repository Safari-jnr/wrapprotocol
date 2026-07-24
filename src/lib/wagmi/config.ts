// This file is only imported by WagmiProvider which is loaded with ssr:false.

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

const projectId = (process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "").trim();

const connectors = connectorsForWallets(
  [
    {
      groupName: "Popular",
      wallets: [metaMaskWallet, trustWallet, coinbaseWallet, okxWallet, rainbowWallet, rabbyWallet],
    },
    {
      groupName: "More",
      wallets: [bitgetWallet, braveWallet, zerionWallet, safeWallet, ledgerWallet, walletConnectWallet],
    },
  ],
  {
    appName: "MORK Protocol",
    projectId: projectId || "d46565a269ee047b44f7ca0b9fec2fa1",
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
