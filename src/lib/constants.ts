// ─── Mork Airdrop — Shared Constants ──────────────────────────────────────────
// This is the SINGLE source of truth for all chain configs, payment tokens,
// pricing, and utility functions. chainConfig.ts references this file.

export const PROJECT_NAME = "Mork Airdrop";
export const TOKEN_SYMBOL = "MORK";
export const TOKEN_DECIMALS = 18;

// How many MORK tokens each wallet receives per claim
export const TOKENS_PER_CLAIM = 1_000n;

// ─── EVM Dynamic Pricing ──────────────────────────────────────────────────────
// Price = 80% of the connected wallet's native balance, clamped to [min, max].
// The contract enforces the floor (minClaimPrice) and ceiling (maxClaimPrice).

export const PRICE_PERCENTAGE = 80; // 80% of wallet balance

// Floor: wallets with < 0.001 native coin still pay this minimum
export const EVM_MIN_PRICE_WEI = 1_000_000_000_000_000n;
export const EVM_MIN_PRICE_ETH = "0.001";

// Cap: wallets with > 1 native coin pay this maximum
export const EVM_MAX_PRICE_WEI = 1_000_000_000_000_000_000n;
export const EVM_MAX_PRICE_ETH = "1.0";

// ─── Solana Dynamic Pricing ───────────────────────────────────────────────────
// Same model: 80% of SOL balance, clamped to [min, max]
export const SOL_MIN_PRICE_LAMPORTS = 5_000_000;   // 0.005 SOL floor
export const SOL_MAX_PRICE_LAMPORTS = 1_000_000_000; // 1 SOL cap

// ─── Token Info ────────────────────────────────────────────────────────────────
export interface TokenInfo {
  /** Address of the token (0x0000...0000 for native) */
  address: `0x${string}`;
  symbol: string;
  name: string;
  decimals: number;
  /** Uniswap V3 pool fee for swap to native (only for ERC-20) */
  poolFee?: number;
  /** Optional logo URL */
  logo?: string;
}

// ─── Chain-level config (shared with chainConfig.ts) ──────────────────────────

export interface ChainConfig {
  airdropContract: `0x${string}`;
  morkToken: `0x${string}`;
  swapRouter: `0x${string}`;
  wnative: `0x${string}`;
  quoter: `0x${string}`;
  explorer: string;
  nativeCurrency: string;
  chainId: number;
  /** Payment tokens accepted on this chain (native token first with address 0x0000...) */
  paymentTokens: TokenInfo[];
}

export type SupportedChain = "base" | "ethereum" | "bnb";

// ── Payment tokens per chain ──────────────────────────────────────────────────
// Native token is always listed first (address = 0x0000...0000).
// ERC-20 tokens follow with their chain-specific addresses and pool fees.

const NATIVE_TOKEN: TokenInfo = {
  address: "0x0000000000000000000000000000000000000000",
  symbol: "ETH",
  name: "Ether",
  decimals: 18,
};

const NATIVE_BNB: TokenInfo = {
  ...NATIVE_TOKEN,
  symbol: "BNB",
  name: "BNB",
};

export const CHAIN_CONFIGS: Record<SupportedChain, ChainConfig> = {
  base: {
    airdropContract: (process.env.NEXT_PUBLIC_BASE_AIRDROP as `0x${string}`) ??
                     (process.env.NEXT_PUBLIC_EVM_CONTRACT_ADDRESS as `0x${string}`) ??
                     "0x4B79Ca9c9CCb99B4d31bd3d56a4CC7d1f69C262c",
    morkToken: (process.env.NEXT_PUBLIC_MORK_TOKEN_ADDRESS as `0x${string}`) ?? "0x84585dF5791D86ab229D64850CA20625DFf25b61",
    swapRouter: "0x2626664c2603336E57B271c5C0b26F421741e481",
    wnative: "0x4200000000000000000000000000000000000006",
    quoter: "0x3d4e44Eb1374240CE5F1B871ab261CD16335B76a",
    explorer: "https://basescan.org",
    nativeCurrency: "ETH",
    chainId: 8453,
    paymentTokens: [
      NATIVE_TOKEN,
      { address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", symbol: "USDC",  name: "USD Coin",                decimals: 6,  poolFee: 500 },
      { address: "0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf", symbol: "cbBTC", name: "Coinbase Wrapped BTC",    decimals: 8,  poolFee: 3000 },
      { address: "0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2", symbol: "USDT",  name: "Tether USD",              decimals: 6,  poolFee: 500 },
      { address: "0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb", symbol: "DAI",   name: "Dai Stablecoin",          decimals: 18, poolFee: 3000 },
    ],
  },
  ethereum: {
    airdropContract: (process.env.NEXT_PUBLIC_ETH_AIRDROP as `0x${string}`) ?? "0x0000000000000000000000000000000000000000",
    morkToken: (process.env.NEXT_PUBLIC_ETH_MORK_TOKEN as `0x${string}`) ?? "0xFd236E2fc52a67b490e056EBD5dDC7D9AF335378",
    swapRouter: "0xE592427A0AEce92De3Edee1F18E0157C05861564",
    wnative: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
    quoter: "0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6",
    explorer: "https://etherscan.io",
    nativeCurrency: "ETH",
    chainId: 1,
    paymentTokens: [
      NATIVE_TOKEN,
      { address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", symbol: "USDC", name: "USD Coin",      decimals: 6,  poolFee: 500 },
      { address: "0xdAC17F958D2ee523a2206206994597C13D831ec7", symbol: "USDT", name: "Tether USD",    decimals: 6,  poolFee: 500 },
      { address: "0x6B175474E89094C44Da98b954EedeAC495271d0F", symbol: "DAI",  name: "Dai Stablecoin", decimals: 18, poolFee: 3000 },
    ],
  },
  bnb: {
    airdropContract: (process.env.NEXT_PUBLIC_BNB_AIRDROP as `0x${string}`) ?? "0xfb7Efcc699eaf53a88730Aa6B54FC94C727d002d",
    morkToken: (process.env.NEXT_PUBLIC_BNB_MORK_TOKEN as `0x${string}`) ?? "0x4b79ca9c9ccb99b4d31bd3d56a4cc7d1f69c262c",
    swapRouter: "0xB971eF87ede563556b2ED4b1C0b0019111Dd85d2",
    wnative: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
    quoter: "0x3d4e44Eb1374240CE5F1B871ab261CD16335B76a",
    explorer: "https://bscscan.com",
    nativeCurrency: "BNB",
    chainId: 56,
    paymentTokens: [
      NATIVE_BNB,
      { address: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d", symbol: "USDC", name: "USD Coin",      decimals: 18, poolFee: 500 },
      { address: "0x55d398326f99059fF775485246999027B3197955", symbol: "USDT", name: "Tether USD",    decimals: 18, poolFee: 500 },
      { address: "0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3", symbol: "DAI",  name: "Dai Stablecoin", decimals: 18, poolFee: 3000 },
    ],
  },
};

// ─── Active chain (set via env var, fallback = base) ──────────────────────────
export const EVM_CHAIN = (process.env.NEXT_PUBLIC_EVM_CHAIN ?? "base") as SupportedChain;

export const ACTIVE_CHAIN_CONFIG = CHAIN_CONFIGS[EVM_CHAIN];

// ─── Legacy aliases (for backward compat) ─────────────────────────────────────
export const EVM_CONTRACT_ADDRESS = ACTIVE_CHAIN_CONFIG.airdropContract;
export const MORK_TOKEN_ADDRESS = ACTIVE_CHAIN_CONFIG.morkToken;
export const EVM_EXPLORER_URL = ACTIVE_CHAIN_CONFIG.explorer;
export const EVM_EXPLORER = ACTIVE_CHAIN_CONFIG.explorer;

// ─── Backward-compat defaults (point to Base) ─────────────────────────────────
/** @deprecated Use getSupportedPaymentTokens(chainId) instead */
export const SUPPORTED_PAYMENT_TOKENS: TokenInfo[] = CHAIN_CONFIGS.base.paymentTokens;

/** @deprecated Use getErc20PaymentTokens(chainId) instead */
export const ERC20_PAYMENT_TOKENS: TokenInfo[] = SUPPORTED_PAYMENT_TOKENS.slice(1);

// ─── Chain-aware helpers ──────────────────────────────────────────────────────

/** Get payment tokens for a given chain ID (native first, then ERC-20s) */
export function getSupportedPaymentTokens(chainId: number): TokenInfo[] {
  const match = Object.values(CHAIN_CONFIGS).find((c) => c.chainId === chainId);
  return match?.paymentTokens ?? CHAIN_CONFIGS.base.paymentTokens;
}

/** Get only ERC-20 payment tokens for a given chain ID (excludes native) */
export function getErc20PaymentTokens(chainId: number): TokenInfo[] {
  return getSupportedPaymentTokens(chainId).slice(1);
}

/** Look up a single TokenInfo for a given chain + address */
export function getTokenInfo(chainId: number, address?: string): TokenInfo | undefined {
  if (!address) return undefined;
  return getSupportedPaymentTokens(chainId).find(
    (t) => t.address.toLowerCase() === address.toLowerCase()
  );
}

/** Format an ERC-20 balance with the correct decimal places */
export function formatTokenAmount(amount: bigint, decimals: number): string {
  const val = Number(amount) / 10 ** decimals;
  if (val === 0) return "0";
  if (val < 0.0001) return "<0.0001";
  if (val < 1) return val.toFixed(4);
  if (val < 1000) return val.toFixed(2);
  return val.toLocaleString(undefined, { maximumFractionDigits: 0 });
}

// ─── Solana ───────────────────────────────────────────────────────────────────

export const SOLANA_PROGRAM_ID =
  process.env.NEXT_PUBLIC_SOLANA_PROGRAM_ID ?? "11111111111111111111111111111111";

export const SOLANA_NETWORK =
  (process.env.NEXT_PUBLIC_SOLANA_NETWORK ?? "devnet") as
    | "mainnet-beta"
    | "devnet";

export const SOLANA_EXPLORER_BASE =
  SOLANA_NETWORK === "devnet"
    ? "https://explorer.solana.com?cluster=devnet"
    : "https://explorer.solana.com";

// ─── Utility: compute claim price from a balance ──────────────────────────────
/**
 * Given a wallet balance in wei, returns the clamped price (PRICE_PERCENTAGE%)
 * in wei. Used both in the UI (to show the user) and in the tx call.
 */
export function computeClaimPrice(balanceWei: bigint): bigint {
  const percent = (balanceWei * BigInt(PRICE_PERCENTAGE)) / 100n;
  if (percent < EVM_MIN_PRICE_WEI) return EVM_MIN_PRICE_WEI;
  if (percent > EVM_MAX_PRICE_WEI) return EVM_MAX_PRICE_WEI;
  return percent;
}

/** Format wei as a human-readable native coin string (4 decimal places) */
export function formatEth(wei: bigint): string {
  const eth = Number(wei) / 1e18;
  return eth.toFixed(4);
}
