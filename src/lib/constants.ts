// ─── Mork Airdrop — Shared Constants ──────────────────────────────────────────
// Update these before mainnet / devnet deploy. Everything else references these.

export const PROJECT_NAME = "Mork Airdrop";
export const TOKEN_SYMBOL = "MORK";
export const TOKEN_DECIMALS = 18;

// How many MORK tokens each wallet receives per claim
export const TOKENS_PER_CLAIM = 1_000n; // BigInt, used with parseUnits

// ─── EVM Dynamic Pricing ──────────────────────────────────────────────────────
// Price = 30% of the connected wallet's ETH balance, clamped to [min, max].
// The contract enforces the floor (minClaimPrice) and ceiling (maxClaimPrice).
// The 30% calculation happens client-side in the frontend.

export const PRICE_PERCENTAGE = 30; // 30% of wallet balance

// Floor: wallets with < 0.001 ETH still pay this minimum
export const EVM_MIN_PRICE_WEI = 1_000_000_000_000_000n; // 0.001 ETH
export const EVM_MIN_PRICE_ETH = "0.001";

// Cap: wallets with > 1 ETH pay this maximum
export const EVM_MAX_PRICE_WEI = 1_000_000_000_000_000_000n; // 1 ETH
export const EVM_MAX_PRICE_ETH = "1.0";

// ─── Solana Dynamic Pricing ───────────────────────────────────────────────────
// Same model: 30% of SOL balance, clamped to [min, max]
export const SOL_MIN_PRICE_LAMPORTS = 5_000_000;   // 0.005 SOL floor
export const SOL_MAX_PRICE_LAMPORTS = 1_000_000_000; // 1 SOL cap

// ─── Contract addresses (fill in after deploy) ────────────────────────────────
export const EVM_CONTRACT_ADDRESS =
  (process.env.NEXT_PUBLIC_EVM_CONTRACT_ADDRESS as `0x${string}`) ??
  "0x0000000000000000000000000000000000000000";

export const MORK_TOKEN_ADDRESS =
  (process.env.NEXT_PUBLIC_MORK_TOKEN_ADDRESS as `0x${string}`) ??
  "0x0000000000000000000000000000000000000000";

export const SOLANA_PROGRAM_ID =
  process.env.NEXT_PUBLIC_SOLANA_PROGRAM_ID ?? "11111111111111111111111111111111";

// ─── Network / chain config ───────────────────────────────────────────────────
export const EVM_CHAIN = (process.env.NEXT_PUBLIC_EVM_CHAIN ?? "sepolia") as
  | "mainnet"
  | "base"
  | "sepolia";

export const SOLANA_NETWORK =
  (process.env.NEXT_PUBLIC_SOLANA_NETWORK ?? "devnet") as
    | "mainnet-beta"
    | "devnet";

export const EVM_EXPLORER: Record<typeof EVM_CHAIN, string> = {
  mainnet: "https://etherscan.io",
  base: "https://basescan.org",
  sepolia: "https://sepolia.etherscan.io",
};

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

/** Format wei as a human-readable ETH string (4 decimal places) */
export function formatEth(wei: bigint): string {
  const eth = Number(wei) / 1e18;
  return eth.toFixed(4);
}
