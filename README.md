# 🪐 Mork Airdrop

Fixed-price, one-claim-per-wallet token airdrop for EVM + Solana.

## Roles

| Dev | Owns |
|-----|------|
| **Safari** | Backend, DB, Smart Contracts, Vercel + Supabase infra |
| **Mide** | Frontend components, pages, wallet UI |

---

## Quick Start (Safari)

```bash
# 1. Install deps
npm install

# 2. Copy env template and fill values
cp .env.example .env.local

# 3. Run dev server
npm run dev
```

---

## Project Structure

```
src/
  app/                      Next.js App Router pages & API routes
    page.tsx                Landing page
    dashboard/page.tsx      User dashboard (claim flow)
    auth/callback/route.ts  Supabase magic-link callback
    api/claims/route.ts     Mirror claim to Supabase (POST)
    api/stats/route.ts      Public stats endpoint (GET)
  components/
    providers/              WagmiProvider, SolanaProvider, SupabaseProvider
    ui/                     ClaimButton, ClaimStatus, ClaimHistory, WalletInfo, etc.
  lib/
    constants.ts            All tunable values (price, token amount, addresses)
    abi.ts                  MorkAirdrop contract ABI
    supabase/               Browser + server Supabase clients, DB types
    wagmi/                  Wagmi config + chain setup
contracts/
  evm/MorkAirdrop.sol       Solidity contract (B2)
indexer/
  evm-indexer.ts            EVM event listener → Supabase (B5)
supabase/
  schema.sql                Full DB schema with RLS policies (B1)
  stats-cron.sql            pg_cron job for aggregate stats (B5)
```

---

## Safari's Deploy Checklist (B0)

- [ ] Create Vercel project, connect repo
- [ ] Create Supabase project, run `supabase/schema.sql`
- [ ] Set all env vars in Vercel (from `.env.example`)
- [ ] Share only `NEXT_PUBLIC_*` keys with Mide — keep `SUPABASE_SERVICE_ROLE_KEY` private
- [ ] Deploy EVM contract to testnet → update `NEXT_PUBLIC_EVM_CONTRACT_ADDRESS`
- [ ] Deploy Solana program to devnet → update `NEXT_PUBLIC_SOLANA_PROGRAM_ID`
- [ ] Run indexer (`indexer/evm-indexer.ts`) or deploy as a cron
- [ ] Set up `supabase/stats-cron.sql` via Supabase pg_cron
- [ ] Get external audit before mainnet

---

## Contract (EVM)

`contracts/evm/MorkAirdrop.sol`

- Fixed price (wei) + fixed token amount per claim
- One claim per wallet via `hasClaimed` mapping
- ETH forwarded immediately to treasury multisig (never held by contract)
- Ownable pause/update + `rescueETH()` for safety
- Uses OpenZeppelin ReentrancyGuard + SafeERC20

**Deploy with Hardhat or Foundry — not included in this repo (add separately).**

---

## Security Notes

- This site uses standard wallet-connect only — no seed phrase input, ever.
- The smart contract is the source of truth. Supabase is display-only.
- `SUPABASE_SERVICE_ROLE_KEY` must never be exposed to the browser or Mide.
- Do not deploy to mainnet without an external audit.
