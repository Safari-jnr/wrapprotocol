/**
 * ─── Multi-Chain Deployment Config ────────────────────────────────────────────
 *
 * Thin layer over constants.ts CHAIN_CONFIGS that provides dynamic chain lookup
 * by chain ID. The actual addresses live in constants.ts (single source of truth).
 */

import { CHAIN_CONFIGS } from "@/lib/constants";
import type { ChainConfig as Cc } from "@/lib/constants";

export interface ChainDeployment {
  chainId: number;
  name: string;
  airdropContract: `0x${string}`;
  morkToken: `0x${string}`;
  swapRouter: `0x${string}`;
  wrappedNative: `0x${string}`;
  quoter: `0x${string}`;
  explorer: string;
  nativeSymbol: string;
  paymentTokens: {
    address: `0x${string}`;
    symbol: string;
    name: string;
    decimals: number;
    poolFee: number;
  }[];
}

const CHAIN_NAMES: Record<string, string> = {
  base: "Base",
  ethereum: "Ethereum Mainnet",
  bnb: "BNB Chain",
};

function toDeployment(key: string, cfg: Cc): ChainDeployment {
  return {
    chainId: cfg.chainId,
    name: CHAIN_NAMES[key] ?? key,
    airdropContract: cfg.airdropContract,
    morkToken: cfg.morkToken,
    swapRouter: cfg.swapRouter,
    wrappedNative: cfg.wnative,
    quoter: cfg.quoter,
    explorer: cfg.explorer,
    nativeSymbol: cfg.nativeCurrency,
    paymentTokens: cfg.paymentTokens
      .filter((t) => t.address !== "0x0000000000000000000000000000000000000000")
      .map((t) => ({
        address: t.address,
        symbol: t.symbol,
        name: t.name,
        decimals: t.decimals,
        poolFee: t.poolFee ?? 3000,
      })),
  };
}

const DEPLOYMENTS: Record<string, ChainDeployment> = {};
for (const [key, cfg] of Object.entries(CHAIN_CONFIGS)) {
  DEPLOYMENTS[key] = toDeployment(key, cfg);
}

// ── Lookup helpers ───────────────────────────────────────────────────────────

/**
 * Get deployment config for a given chain ID.
 * Falls back to Base if chain isn't configured yet.
 */
export function getChainDeployment(chainId: number): ChainDeployment {
  const match = Object.values(DEPLOYMENTS).find((d) => d.chainId === chainId);
  return match ?? DEPLOYMENTS.base;
}

/** Get the EVM explorer URL for a chain */
export function getExplorerUrl(chainId: number): string {
  return getChainDeployment(chainId).explorer;
}

/** Get native symbol for a chain */
export function getNativeSymbol(chainId: number): string {
  return getChainDeployment(chainId).nativeSymbol;
}

export { DEPLOYMENTS };
