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
import { mainnet, base, baseSepolia, sepolia } from "wagmi/chains";
import { EVM_CHAIN, PROJECT_NAME } from "@/lib/constants";

const activeChain =
  EVM_CHAIN === "base"
    ? base
    : EVM_CHAIN === "ethereum"
      ? mainnet
      : EVM_CHAIN === "bnb"
        ? mainnet
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

export const wagmiConfig = createConfig({
  connectors,
  chains: [activeChain],
  transports: {
    [activeChain.id]: http(),
  } as any,
  ssr: true,
});

export { activeChain };
