// ─── Project constants ────────────────────────────────────────────────────────
// Leave PROJECT_NAME blank — owner will fill in the branding

export const PROJECT_NAME = "";        // Owner to provide
export const TOKEN_SYMBOL = "MORK";
export const TOKEN_DECIMALS = 18;

export const TOKENS_PER_CLAIM = 1_000n;

// ─── EVM Dynamic Pricing ──────────────────────────────────────────────────────
export const PRICE_PERCENTAGE = 30;

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
