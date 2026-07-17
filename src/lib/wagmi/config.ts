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

// ⚠ IMPORTANT: For mobile (MetaMask/OKX in-app browser) WalletConnect QR modal support,
// get a REAL WalletConnect Project ID free at https://cloud.walletconnect.com and set:
// NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_real_project_id
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;

// On mobile (MetaMask, OKX in-app browsers), wallets inject window.ethereum directly
// and RainbowKit detects them natively. WalletConnect is only needed for QR code modal
// (e.g. desktop-to-mobile pairing). If no projectId is set, we exclude walletConnectWallet
// to avoid connection failures — direct injection still works fine.
const HAS_WALLETCONNECT = !!projectId;

// Only call connectorsForWallets with a projectId when one exists to avoid
// RainbowKit initialization errors with an empty project ID.
const WALLETS_CONFIG = HAS_WALLETCONNECT
  ? connectorsForWallets(
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
    )
  : connectorsForWallets(
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
          ],
        },
      ],
      { appName: PROJECT_NAME, projectId: "fallback" }
    );

// All supported chains — users can connect to any of them
const SUPPORTED_CHAINS = [mainnet, base, bsc] as const;

// RPC URLs — use env vars if set, otherwise fall back to public RPCs
// Set these on Vercel for reliable private RPC access:
// ETH_RPC_URL=https://eth-mainnet.g.alchemy.com/v2/YOUR_KEY
// BASE_RPC_URL=https://base-mainnet.g.alchemy.com/v2/YOUR_KEY
// BNB_RPC_URL=https://bsc-mainnet.g.alchemy.com/v2/YOUR_KEY
const rpc = (url?: string) => (url ? http(url) : http());

export const wagmiConfig = createConfig({
  connectors: WALLETS_CONFIG,
  chains: SUPPORTED_CHAINS,
  transports: {
    [mainnet.id]: rpc(process.env.NEXT_PUBLIC_ETH_RPC_URL),
    [base.id]: rpc(process.env.NEXT_PUBLIC_BASE_RPC_URL),
    [bsc.id]: rpc(process.env.NEXT_PUBLIC_BNB_RPC_URL),
  },
  ssr: true,
});

export { activeChain };
