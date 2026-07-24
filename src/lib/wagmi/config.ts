// ─── Wagmi + RainbowKit config ────────────────────────────────────────────────
// All connectors and createConfig() live inside makeConfig() — nothing runs at
// module scope. This ensures WalletConnect Core is only initialised once
// (client-side), preventing the "Init() called 2 times" warning.

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
import { connectorsForWallets } from "@rainbow-me/rainbowkit";
import { createConfig, http } from "wagmi";
import { base, mainnet, bsc } from "wagmi/chains";

let _config: ReturnType<typeof createConfig> | null = null;

function makeConfig() {
  if (_config) return _config;

  const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "";
  const hasRealProjectId = projectId.length > 10; // "fallback" and empty both fail this

  // Wallets that work WITHOUT WalletConnect (desktop extension injection only)
  const extensionOnlyWallets = [
    metaMaskWallet,
    coinbaseWallet,
    rabbyWallet,
    braveWallet,
  ];

  // Wallets that REQUIRE WalletConnect (mobile deeplinks, QR codes)
  const walletConnectWallets = [
    trustWallet,
    okxWallet,
    bitgetWallet,
    rainbowWallet,
    zerionWallet,
    imTokenWallet,
    safeWallet,
    ledgerWallet,
    walletConnectWallet,
  ];

  const connectors = connectorsForWallets(
    [
      {
        groupName: "Popular",
        wallets: hasRealProjectId
          ? [...extensionOnlyWallets, ...walletConnectWallets]
          : extensionOnlyWallets,
      },
    ],
    {
      appName: "MORK Protocol",
      projectId: hasRealProjectId ? projectId : "fallback",
    }
  );

  _config = createConfig({
    connectors,
    chains: [base, mainnet, bsc],
    transports: {
      // Prefer env-var private RPCs (set on Vercel). Fallbacks are CORS-safe
      // public endpoints — NOT eth.llamarpc.com which blocks browser requests.
      [base.id]: http(
        process.env.NEXT_PUBLIC_BASE_RPC_URL ?? "https://mainnet.base.org"
      ),
      [mainnet.id]: http(
        process.env.NEXT_PUBLIC_ETH_RPC_URL ?? "https://cloudflare-eth.com"
      ),
      [bsc.id]: http(
        process.env.NEXT_PUBLIC_BNB_RPC_URL ?? "https://bsc-dataseed1.binance.org"
      ),
    },
    ssr: true,
  });

  return _config;
}

export const wagmiConfig = makeConfig();
