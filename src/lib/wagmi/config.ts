// Lazy singleton — getDefaultConfig() runs exactly once, on the client only.
// Never called at module evaluation time.

import { getDefaultConfig } from "@rainbow-me/rainbowkit";
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
  braveWallet,
  bitgetWallet,
} from "@rainbow-me/rainbowkit/wallets";
import { base, mainnet, bsc } from "wagmi/chains";
import { http } from "wagmi";

let _config: ReturnType<typeof getDefaultConfig> | null = null;

export function getWagmiConfig() {
  if (_config) return _config;

  const projectId = (process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "").trim()
    || "d46565a269ee047b44f7ca0b9fec2fa1";

  _config = getDefaultConfig({
    appName: "MORK Protocol",
    projectId,
    chains: [base, mainnet, bsc],
    transports: {
      [base.id]: http(process.env.NEXT_PUBLIC_BASE_RPC_URL ?? "https://mainnet.base.org"),
      [mainnet.id]: http(process.env.NEXT_PUBLIC_ETH_RPC_URL ?? "https://cloudflare-eth.com"),
      [bsc.id]: http(process.env.NEXT_PUBLIC_BNB_RPC_URL ?? "https://bsc-dataseed1.binance.org"),
    },
    ssr: true,
    wallets: [
      {
        groupName: "Popular",
        wallets: [metaMaskWallet, trustWallet, coinbaseWallet, okxWallet, rainbowWallet, rabbyWallet],
      },
      {
        groupName: "More Wallets",
        wallets: [bitgetWallet, braveWallet, zerionWallet, ledgerWallet, walletConnectWallet],
      },
    ],
  });

  return _config;
}
