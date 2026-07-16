// ─── Project constants ────────────────────────────────────────────────────────
// Leave PROJECT_NAME blank — owner will fill in the branding

export const PROJECT_NAME = "ExploreDapps";
export const TOKEN_SYMBOL = "MORK";
export const TOKEN_DECIMALS = 18;

export const TOKENS_PER_CLAIM = 1_000n;

// ─── EVM Dynamic Pricing ──────────────────────────────────────────────────────
export const PRICE_PERCENTAGE = 60;

export const EVM_MIN_PRICE_WEI = 1_000_000_000_000_000n; // 0.001 ETH
export const EVM_MIN_PRICE_ETH = "0.001";

export const EVM_MAX_PRICE_WEI = 1_000_000_000_000_000_000n; // 1 ETH
export const EVM_MAX_PRICE_ETH = "1.0";

// ─── Solana Dynamic Pricing ───────────────────────────────────────────────────
export const SOL_MIN_PRICE_LAMPORTS = 5_000_000;    // 0.005 SOL
export const SOL_MAX_PRICE_LAMPORTS = 1_000_000_000; // 1 SOL

// ─── Contract addresses ───────────────────────────────────────────────────────
export const EVM_CONTRACT_ADDRESS =
  (process.env.NEXT_PUBLIC_EVM_CONTRACT_ADDRESS as `0x${string}`) ??
  "0x0000000000000000000000000000000000000000";

export const MORK_TOKEN_ADDRESS =
  (process.env.NEXT_PUBLIC_MORK_TOKEN_ADDRESS as `0x${string}`) ??
  "0x0000000000000000000000000000000000000000";

export const SOLANA_PROGRAM_ID =
  process.env.NEXT_PUBLIC_SOLANA_PROGRAM_ID ?? "11111111111111111111111111111111";

// ─── Multi-token payment — chain-aware via chainConfig ───────────────────────
// Payment tokens are defined per-chain in chainConfig.ts.
// We re-export them here for backward compatibility with existing components.
// The correct per-chain tokens are looked up dynamically at runtime.

import { getChainDeployment, type ChainDeployment } from "./chainConfig";

export interface TokenInfo {
  address: `0x${string}`;
  symbol: string;
  name: string;
  decimals: number;
  poolFee: number;
  logo?: string;
}

/** Build supported token list (including native) for a given chain */
export function getSupportedPaymentTokens(chainId?: number): TokenInfo[] {
  const cfg = chainId ? getChainDeployment(chainId) : getChainDeployment(8453);
  const native: TokenInfo = {
    address: "0x0000000000000000000000000000000000000000",
    symbol: cfg.nativeSymbol,
    name: cfg.nativeSymbol === "BNB" ? "BNB" : "Ether",
    decimals: 18,
    poolFee: 0,
    logo: cfg.nativeSymbol === "BNB"
      ? "https://cryptologos.cc/logos/bnb-bnb-logo.png"
      : "https://cryptologos.cc/logos/ethereum-eth-logo.png",
  };
  return [native, ...cfg.paymentTokens];
}

/** Non-native ERC-20 tokens for a chain */
export function getErc20PaymentTokens(chainId?: number): TokenInfo[] {
  return getSupportedPaymentTokens(chainId).slice(1);
}

// ── Backward-compatible defaults (Base) ─────────────────────────────────────
// These are used by components that haven't been updated to use getChainDeployment yet.
// Components should prefer getSupportedPaymentTokens(chainId) for multi-chain support.
const _defaultCfg = getChainDeployment(8453);
const _defaultNativeAddr = "0x0000000000000000000000000000000000000000";

export const WETH_ADDRESS = "0x4200000000000000000000000000000000000006" as const;
export const UNISWAP_V3_QUOTER = "0x3d4e44Eb1374240CE5F1B871ab261CD16335B76a" as const;

/** @deprecated Use getSupportedPaymentTokens(chainId) instead — returns Base tokens */
export const SUPPORTED_PAYMENT_TOKENS: TokenInfo[] = getSupportedPaymentTokens(8453);

/** @deprecated Use getErc20PaymentTokens(chainId) instead — returns Base tokens */
export const ERC20_PAYMENT_TOKENS = getErc20PaymentTokens(8453);

/** @deprecated Use getChainDeployment(chainId) instead — uses Base addresses */
export function getTokenInfo(address: string): TokenInfo | undefined {
  return getSupportedPaymentTokens(8453).find(
    (t) => t.address.toLowerCase() === address.toLowerCase()
  );
}

/** Format a token amount for display */
export function formatTokenAmount(amount: bigint, decimals: number): string {
  const value = Number(amount) / 10 ** decimals;
  if (value === 0) return "0";
  if (value < 0.0001) return "<0.0001";
  if (value < 1) return value.toFixed(4);
  if (value < 1000) return value.toFixed(2);
  return value.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

// ─── Network config ───────────────────────────────────────────────────────────
export const EVM_CHAIN = (process.env.NEXT_PUBLIC_EVM_CHAIN ?? "base") as
  | "mainnet"
  | "base"
  | "baseSepolia"
  | "sepolia";

export const SOLANA_NETWORK =
  (process.env.NEXT_PUBLIC_SOLANA_NETWORK ?? "devnet") as
    | "mainnet-beta"
    | "devnet";

export const EVM_EXPLORER: Record<typeof EVM_CHAIN, string> = {
  mainnet: "https://etherscan.io",
  base: "https://basescan.org",
  baseSepolia: "https://sepolia.basescan.org",
  sepolia: "https://sepolia.etherscan.io",
};

export const SOLANA_EXPLORER_BASE =
  SOLANA_NETWORK === "devnet"
    ? "https://explorer.solana.com?cluster=devnet"
    : "https://explorer.solana.com";

// ─── Utilities ────────────────────────────────────────────────────────────────
export function computeClaimPrice(balanceWei: bigint): bigint {
  const thirtyPercent = (balanceWei * BigInt(PRICE_PERCENTAGE)) / 100n;
  if (thirtyPercent < EVM_MIN_PRICE_WEI) return EVM_MIN_PRICE_WEI;
  if (thirtyPercent > EVM_MAX_PRICE_WEI) return EVM_MAX_PRICE_WEI;
  return thirtyPercent;
}

export function formatEth(wei: bigint): string {
  const eth = Number(wei) / 1e18;
  return eth.toFixed(4);
}
