// Mork Airdrop — Anchor IDL (hand-written, matches contracts/solana/programs/mork-airdrop/src/lib.rs)
// Regenerate with `anchor build` after deploying, then replace this file with
// the generated target/idl/mork_airdrop.json (converted to TS)

export const MORK_AIRDROP_IDL = {
  version: "0.1.0",
  name: "mork_airdrop",
  instructions: [
    {
      name: "initialize",
      accounts: [
        { name: "state", isMut: true, isSigner: false },
        { name: "tokenVault", isMut: false, isSigner: false },
        { name: "authority", isMut: true, isSigner: true },
        { name: "systemProgram", isMut: false, isSigner: false },
      ],
      args: [
        { name: "treasury", type: "publicKey" },
        { name: "minPrice", type: "u64" },
        { name: "maxPrice", type: "u64" },
        { name: "tokensPerClaim", type: "u64" },
      ],
    },
    {
      name: "claim",
      accounts: [
        { name: "state", isMut: true, isSigner: false },
        { name: "claimRecord", isMut: true, isSigner: false },
        { name: "tokenVault", isMut: true, isSigner: false },
        { name: "claimerTokenAccount", isMut: true, isSigner: false },
        { name: "treasury", isMut: true, isSigner: false },
        { name: "claimer", isMut: true, isSigner: true },
        { name: "tokenProgram", isMut: false, isSigner: false },
        { name: "systemProgram", isMut: false, isSigner: false },
      ],
      args: [{ name: "paymentLamports", type: "u64" }],
    },
    {
      name: "setSaleActive",
      accounts: [
        { name: "state", isMut: true, isSigner: false },
        { name: "authority", isMut: false, isSigner: true },
      ],
      args: [{ name: "active", type: "bool" }],
    },
    {
      name: "setPriceRange",
      accounts: [
        { name: "state", isMut: true, isSigner: false },
        { name: "authority", isMut: false, isSigner: true },
      ],
      args: [
        { name: "min", type: "u64" },
        { name: "max", type: "u64" },
      ],
    },
  ],
  accounts: [
    {
      name: "AirdropState",
      type: {
        kind: "struct",
        fields: [
          { name: "authority", type: "publicKey" },
          { name: "treasury", type: "publicKey" },
          { name: "tokenVault", type: "publicKey" },
          { name: "minClaimPrice", type: "u64" },
          { name: "maxClaimPrice", type: "u64" },
          { name: "tokensPerClaim", type: "u64" },
          { name: "saleActive", type: "bool" },
          { name: "totalClaimed", type: "u64" },
          { name: "bump", type: "u8" },
        ],
      },
    },
    {
      name: "ClaimRecord",
      type: {
        kind: "struct",
        fields: [
          { name: "wallet", type: "publicKey" },
          { name: "amountPaid", type: "u64" },
          { name: "tokensReceived", type: "u64" },
          { name: "claimedAt", type: "i64" },
          { name: "bump", type: "u8" },
        ],
      },
    },
  ],
  events: [
    {
      name: "ClaimedEvent",
      fields: [
        { name: "wallet", type: "publicKey", index: false },
        { name: "tokenAmount", type: "u64", index: false },
        { name: "solPaid", type: "u64", index: false },
      ],
    },
  ],
  errors: [
    { code: 6000, name: "SaleNotActive", msg: "Sale is not active" },
    { code: 6001, name: "PaymentBelowMinimum", msg: "Payment below minimum price" },
    { code: 6002, name: "PaymentAboveMaximum", msg: "Payment above maximum price" },
    { code: 6003, name: "InsufficientVaultBalance", msg: "Token vault has insufficient balance" },
    { code: 6004, name: "InvalidPriceRange", msg: "Invalid price range" },
    { code: 6005, name: "WrongTreasury", msg: "Wrong treasury account" },
  ],
} as const;
