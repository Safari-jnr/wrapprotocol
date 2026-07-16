/**
 * ─── Multi-Chain Deployment Config ────────────────────────────────────────────
 *
 * 🔧 After your colleagues deploy the contracts on each chain, fill in the
 *    addresses below. The frontend will automatically use the right addresses
 *    based on which chain the user's wallet is connected to.
 *
 * Example: if user connects to Ethereum Mainnet, the frontend reads
 *          mainnet.airdropContract and mainnet.morkToken.
 *
 * Chain IDs:
 *   1       = Ethereum Mainnet
 *   56      = BNB Chain
 *   8453    = Base
 *   42161   = Arbitrum
 *   10      = Optimism
 */

export interface ChainDeployment {
  chainId: number;
  name: string;
  /** Deployed MorkAirdrop contract address */
  airdropContract: `0x${string}`;
  /** Deployed MorkToken address (bridged or native) */
  morkToken: `0x${string}`;
  /** Uniswap V3 SwapRouter02 address */
  swapRouter: `0x${string}`;
  /** Wrapped native token (WETH/WBNB) address */
  wrappedNative: `0x${string}`;
  /** Uniswap V3 Quoter address */
  quoter: `0x${string}`;
  /** Block explorer base URL */
  explorer: string;
  /** Native currency symbol */
  nativeSymbol: string;
  /** Payment tokens accepted on this chain */
  paymentTokens: {
    /** ERC-20 token address */
    address: `0x${string}`;
    symbol: string;
    name: string;
    decimals: number;
    /** Uniswap V3 pool fee for swap to native */
    poolFee: number;
  }[];
}

// ── FILL IN AFTER COLLEAGUES DEPLOY ─────────────────────────────────────────
// Leave as 0x0000... for chains not yet deployed

const DEPLOYMENTS: Record<string, ChainDeployment> = {
  // ─── Base (already deployed) ──────────────────────────────────────────────
  base: {
    chainId: 8453,
    name: "Base",
    airdropContract: process.env.NEXT_PUBLIC_EVM_CONTRACT_ADDRESS as `0x${string}` ?? "0x0000000000000000000000000000000000000000",
    morkToken: process.env.NEXT_PUBLIC_MORK_TOKEN_ADDRESS as `0x${string}` ?? "0x0000000000000000000000000000000000000000",
    swapRouter: "0x2626664c2603336E57B271c5C0b26F421741e481",
    wrappedNative: "0x4200000000000000000000000000000000000006",
    quoter: "0x3d4e44Eb1374240CE5F1B871ab261CD16335B76a",
    explorer: "https://basescan.org",
    nativeSymbol: "ETH",
    paymentTokens: [
      { address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", symbol: "USDC",  name: "USD Coin",         decimals: 6,  poolFee: 500 },
      { address: "0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf", symbol: "cbBTC", name: "Coinbase Wrapped BTC", decimals: 8,  poolFee: 3000 },
      { address: "0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2", symbol: "USDT",  name: "Tether USD",       decimals: 6,  poolFee: 500 },
      { address: "0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb", symbol: "DAI",   name: "Dai Stablecoin",   decimals: 18, poolFee: 3000 },
    ],
  },

  // ─── Ethereum Mainnet ─────────────────────────────────────────────────────
  mainnet: {
    chainId: 1,
    name: "Ethereum Mainnet",
    airdropContract: "0x0000000000000000000000000000000000000000", // ← FILL IN
    morkToken: "0x0000000000000000000000000000000000000000",       // ← FILL IN (bridged MORK)
    swapRouter: "0xE592427A0AEce92De3Edee1F18E0157C05861564",
    wrappedNative: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
    quoter: "0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6",
    explorer: "https://etherscan.io",
    nativeSymbol: "ETH",
    paymentTokens: [
      { address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", symbol: "USDC", name: "USD Coin",      decimals: 6,  poolFee: 500 },
      { address: "0xdAC17F958D2ee523a2206206994597C13D831ec7", symbol: "USDT", name: "Tether USD",    decimals: 6,  poolFee: 500 },
      { address: "0x6B175474E89094C44Da98b954EedeAC495271d0F", symbol: "DAI",  name: "Dai Stablecoin", decimals: 18, poolFee: 3000 },
    ],
  },

  // ─── BNB Chain ────────────────────────────────────────────────────────────
  bnb: {
    chainId: 56,
    name: "BNB Chain",
    airdropContract: "0x0000000000000000000000000000000000000000", // ← FILL IN
    morkToken: "0x0000000000000000000000000000000000000000",       // ← FILL IN (bridged MORK)
    swapRouter: "0xB971eF87ede563556b2ED4b1C0b0019111Dd85d2",
    wrappedNative: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
    quoter: "0x3d4e44Eb1374240CE5F1B871ab261CD16335B76a",
    explorer: "https://bscscan.com",
    nativeSymbol: "BNB",
    paymentTokens: [
      { address: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d", symbol: "USDC", name: "USD Coin",      decimals: 18, poolFee: 500 },
      { address: "0x55d398326f99059fF775485246999027B3197955", symbol: "USDT", name: "Tether USD",    decimals: 18, poolFee: 500 },
      { address: "0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3", symbol: "DAI",  name: "Dai Stablecoin", decimals: 18, poolFee: 3000 },
    ],
  },
};

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
