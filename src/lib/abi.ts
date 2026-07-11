// Airdrop ABI — matches contracts/evm/MorkAirdrop.sol
// Pricing: 30% of wallet balance, clamped to [minClaimPrice, maxClaimPrice]

export const AIRDROP_ABI = [
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
  // ── Write ─────────────────────────────────────────────────────────────────
  {
    name: "claim",
    type: "function",
    stateMutability: "payable",
    inputs: [],
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
] as const;
