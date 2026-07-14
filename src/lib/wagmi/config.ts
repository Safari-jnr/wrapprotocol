"use client";

import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { mainnet, base, baseSepolia, sepolia } from "wagmi/chains";
import { EVM_CHAIN, PROJECT_NAME } from "@/lib/constants";

const chainMap = { mainnet, base, baseSepolia, sepolia } as const;
const activeChain = chainMap[EVM_CHAIN] ?? sepolia;

export const wagmiConfig = getDefaultConfig({
  appName: PROJECT_NAME,
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "mork-airdrop-dev",
  chains: [activeChain],
  ssr: true, // Next.js App Router — enables SSR-safe hydration
});

export { activeChain };
