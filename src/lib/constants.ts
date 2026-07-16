// ─── Mork Airdrop — Shared Constants ──────────────────────────────────────────
// Update these before mainnet / devnet deploy. Everything else references these.

export const PROJECT_NAME = "Mork Airdrop";
export const TOKEN_SYMBOL = "MORK";
export const TOKEN_DECIMALS = 18;

// How many MORK tokens each wallet receives per claim
export const TOKENS_PER_CLAIM = 1_000n;

// ─── EVM Dynamic Pricing ──────────────────────────────────────────────────────
// Price = 30% of the connected wallet's native balance, clamped to [min, max].
// The contract enforces the floor (minClaimPrice) and ceiling (maxClaimPrice).
// The 30% calculation happens client-side in the frontend.

export const PRICE_PERCENTAGE = 30; // 30% of wallet balance

// Floor: wallets with < 0.001 native coin still pay this minimum
export const EVM_MIN_PRICE_WEI = 1_000_000_000_000_000n;
export const EVM_MIN_PRICE_ETH = "0.001";

// Cap: wallets with > 1 native coin pay this maximum
export const EVM_MAX_PRICE_WEI = 1_000_000_000_000_000_000n;
export const EVM_MAX_PRICE_ETH = "1.0";

// ─── Solana Dynamic Pricing ───────────────────────────────────────────────────
// Same model: 30% of SOL balance, clamped to [min, max]
export const SOL_MIN_PRICE_LAMPORTS = 5_000_000;   // 0.005 SOL floor
export const SOL_MAX_PRICE_LAMPORTS = 1_000_000_000; // 1 SOL cap

// ─── Multi-chain contract addresses ───────────────────────────────────────────
// Each chain has its own MorkAirdrop deployment with its own MORK supply.
// MorkToken lives on Base and is bridged to other chains.
// After deploying on each chain, fill in the addresses below.

export interface ChainConfig {
  /** MorkAirdrop contract address */
  airdropContract: `0x${string}`;
  /** MorkToken (or bridged equivalent) address on this chain */
  morkToken: `0x${string}`;
  /** Uniswap V3 SwapRouter address */
  swapRouter: `0x${string}`;
  /** Wrapped native token (WETH / WBNB) */
  wnative: `0x${string}`;
  /** Block explorer base URL */
  explorer: string;
  /** Native currency symbol */
  nativeCurrency: string;
  /** Chain ID */
  chainId: number;
}

export type SupportedChain = "base" | "ethereum" | "bnb";

export const CHAIN_CONFIGS: Record<SupportedChain, ChainConfig> = {
  base: {
    airdropContract: (process.env.NEXT_PUBLIC_BASE_AIRDROP as `0x${string}`) ?? "0x4B79Ca9c9CCb99B4d31bd3d56a4CC7d1f69C262c",
    morkToken: (process.env.NEXT_PUBLIC_MORK_TOKEN_ADDRESS as `0x${string}`) ?? "0x84585dF5791D86ab229D64850CA20625DFf25b61",
    swapRouter: "0x2626664c2603336E57B271c5C0b26F421741e481",
    wnative: "0x4200000000000000000000000000000000000006",
    explorer: "https://basescan.org",
    nativeCurrency: "ETH",
    chainId: 8453,
  },
  ethereum: {
    airdropContract: (process.env.NEXT_PUBLIC_ETH_AIRDROP as `0x${string}`) ?? "0x0000000000000000000000000000000000000000",
    morkToken: (process.env.NEXT_PUBLIC_ETH_MORK_TOKEN as `0x${string}`) ?? "0xFd236E2fc52a67b490e056EBD5dDC7D9AF335378",
    swapRouter: "0xE592427A0AEce92De3Edee1F18E0157C05861564",
    wnative: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
    explorer: "https://etherscan.io",
    nativeCurrency: "ETH",
    chainId: 1,
  },
  bnb: {
    airdropContract: (process.env.NEXT_PUBLIC_BNB_AIRDROP as `0x${string}`) ?? "0xfb7Efcc699eaf53a88730Aa6B54FC94C727d002d",
    morkToken: (process.env.NEXT_PUBLIC_BNB_MORK_TOKEN as `0x${string}`) ?? "0x4b79ca9c9ccb99b4d31bd3d56a4cc7d1f69c262c",
    swapRouter: "0xB971eF87ede563556b2ED4b1C0b0019111Dd85d2",
    wnative: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
    explorer: "https://bscscan.com",
    nativeCurrency: "BNB",
    chainId: 56,
  },
};

// ─── Active chain (set via env var) ────────────────────────────────────────────
export const EVM_CHAIN = (process.env.NEXT_PUBLIC_EVM_CHAIN ?? "base") as SupportedChain;

export const ACTIVE_CHAIN_CONFIG = CHAIN_CONFIGS[EVM_CHAIN];

// ─── Legacy aliases (for backward compat) ─────────────────────────────────────
export const EVM_CONTRACT_ADDRESS = ACTIVE_CHAIN_CONFIG.airdropContract;
export const MORK_TOKEN_ADDRESS = ACTIVE_CHAIN_CONFIG.morkToken;
export const EVM_EXPLORER_URL = ACTIVE_CHAIN_CONFIG.explorer;
export const EVM_EXPLORER = ACTIVE_CHAIN_CONFIG.explorer;

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

// ─── Utility: compute 30% claim price from a balance ────────────────────────
/**
 * Given a wallet balance in wei, returns the clamped 30% price in wei.
 * Used both in the UI (to show the user) and in the tx call.
 */
export function computeClaimPrice(balanceWei: bigint): bigint {
  const thirtyPercent = (balanceWei * BigInt(PRICE_PERCENTAGE)) / 100n;
  if (thirtyPercent < EVM_MIN_PRICE_WEI) return EVM_MIN_PRICE_WEI;
  if (thirtyPercent > EVM_MAX_PRICE_WEI) return EVM_MAX_PRICE_WEI;
  return thirtyPercent;
}

/** Format wei as a human-readable native coin string (4 decimal places) */
export function formatEth(wei: bigint): string {
  const eth = Number(wei) / 1e18;
  return eth.toFixed(4);
}
