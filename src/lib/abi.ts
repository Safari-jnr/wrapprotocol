// MorkAirdrop.sol ABI — matches contracts/evm/MorkAirdrop.sol
// Pricing: 30% of wallet balance, clamped to [minClaimPrice, maxClaimPrice]

export const MORK_AIRDROP_ABI = [
  // ── Read ──────────────────────────────────────────────────────────────────
  {
    name: "hasClaimed",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "wallet", type: "address" }],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    name: "paidAmount",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "wallet", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "minClaimPrice",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "maxClaimPrice",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "tokensPerClaim",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "saleActive",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    name: "totalClaimed",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "supportedTokens",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "token", type: "address" }],
    outputs: [{ name: "isSupported", type: "bool" }, { name: "poolFee", type: "uint24" }],
  },
  // ── Write ─────────────────────────────────────────────────────────────────
  {
    name: "claim",
    type: "function",
    stateMutability: "payable",
    inputs: [],
    outputs: [],
  },
  {
    name: "claimWithToken",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "tokenIn", type: "address" },
      { name: "amountIn", type: "uint256" },
      { name: "amountOutMin", type: "uint256" },
    ],
    outputs: [],
  },
  // ── Events ────────────────────────────────────────────────────────────────
  {
    name: "Claimed",
    type: "event",
    inputs: [
      { name: "wallet", type: "address", indexed: true },
      { name: "tokenAmount", type: "uint256", indexed: false },
      { name: "ethPaid", type: "uint256", indexed: false },
    ],
  },
  {
    name: "TokenPaymentClaimed",
    type: "event",
    inputs: [
      { name: "wallet", type: "address", indexed: true },
      { name: "token", type: "address", indexed: true },
      { name: "tokenAmount", type: "uint256", indexed: false },
      { name: "ethReceived", type: "uint256", indexed: false },
    ],
  },
] as const;

// Alias used by Mide's frontend components
export const AIRDROP_ABI = MORK_AIRDROP_ABI;

// ── Minimal ERC-20 ABI for balanceOf / approve / allowance ────────────────────
export const ERC20_ABI = [
  {
    name: "balanceOf",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "approve",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    name: "allowance",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
    ],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "decimals",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint8" }],
  },
] as const;

// ── Uniswap V3 Quoter ABI — for estimating ETH output from token swaps ─────────
export const UNISWAP_QUOTER_ABI = [
  {
    name: "quoteExactInputSingle",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "tokenIn", type: "address" },
      { name: "tokenOut", type: "address" },
      { name: "fee", type: "uint24" },
      { name: "amountIn", type: "uint256" },
      { name: "sqrtPriceLimitX96", type: "uint160" },
    ],
    outputs: [{ name: "amountOut", type: "uint256" }],
  },
] as const;
