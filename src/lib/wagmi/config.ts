"use client";

import { connectorsForWallets } from "@rainbow-me/rainbowkit";
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
} from "@rainbow-me/rainbowkit/wallets";
import { createConfig, http } from "wagmi";
import { mainnet, base, baseSepolia, sepolia, bsc } from "wagmi/chains";
import { EVM_CHAIN, PROJECT_NAME } from "@/lib/constants";

const activeChain =
  EVM_CHAIN === "base"
    ? base
    : EVM_CHAIN === "ethereum"
      ? mainnet
      : EVM_CHAIN === "bnb"
        ? bsc
        : sepolia;

const projectId =
  process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "mork-airdrop-dev";

const connectors = connectorsForWallets(
  [
    {
      groupName: "Supported",
      wallets: [
        metaMaskWallet,
        trustWallet,
        coinbaseWallet,
        okxWallet,
        rainbowWallet,
        rabbyWallet,
        zerionWallet,
        ledgerWallet,
        walletConnectWallet,
      ],
    },
  ],
  { appName: PROJECT_NAME, projectId }
);

// All supported chains — users can connect to any of them
const SUPPORTED_CHAINS = [mainnet, base, bsc] as const;

export const wagmiConfig = createConfig({
  connectors,
  chains: SUPPORTED_CHAINS,
  transports: {
    [mainnet.id]: http(),
    [base.id]: http(),
    [bsc.id]: http(),
  },
  ssr: true,
});

export { activeChain };
