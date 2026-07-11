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

## 🎨 Design System

### Color Palette
| Token | Value | Usage |
|-------|-------|-------|
| `#0A0A0F` | Surface-950 | Primary background |
| `#12121A` | Surface-900 | Secondary background |
| `#6366F1` | Accent-500 | Primary accent (indigo) |
| `#8B5CF6` | Violet-500 | Secondary accent (violet) |
| `#EC4899` | Pink-500 | Tertiary accent (pink) |
| `#22C55E` | Success | Claim confirmations |

### Effects
- **Glassmorphism** — `backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl`
- **Gradients** — `bg-gradient-to-r from-accent-500 via-violet-500 to-pink-500` for CTAs
- **Glow effects** — Subtle box-shadows with accent colors
- **Animated background** — Radial gradient orbs with float animation
- **Scroll-triggered navbar** — Transparent → blur on scroll past 50px

### Typography
- **Headlines** — Geist (system-ui fallback), bold, tight tracking
- **Body** — Geist, regular, 1.6 line-height
- **Mono** — JetBrains Mono / ui-monospace for wallet addresses

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 16 (App Router) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS v4 |
| **Wallet (EVM)** | Wagmi v3 + RainbowKit v2 |
| **Wallet (Solana)** | @solana/wallet-adapter |
| **Backend** | Supabase (Postgres + Auth) |
| **Smart Contracts** | Solidity (EVM) + Solana Native |
| **Package Manager** | pnpm |

## 📁 Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── claims/route.ts      # Mirror claim to Supabase (POST)
│   │   ├── stats/route.ts       # Public stats endpoint (GET)
│   │   └── feedback/route.ts    # User feedback endpoint (POST)
│   ├── auth/callback/route.ts   # Supabase magic-link callback
│   ├── dashboard/page.tsx       # Airdrop claim dashboard
│   ├── layout.tsx               # Root layout (providers, navbar, footer)
│   └── page.tsx                 # Landing page (hero, features, etc.)
├── components/
│   ├── providers/               # WagmiProvider, SolanaProvider, SupabaseProvider
│   └── ui/                      # ClaimButton, ClaimHistory, Footer, Navbar, etc.
├── lib/
│   ├── constants.ts             # Tunable values (price, token, addresses)
│   ├── abi.ts                   # Airdrop contract ABI
│   ├── solana/useSolanaClaim.ts # Solana claim hook
│   ├── supabase/                # Browser + server Supabase clients
│   └── wagmi/config.ts          # Wagmi + RainbowKit configuration
contracts/
  evm/MorkAirdrop.sol            # Solidity contract
indexer/
  evm-indexer.ts                 # EVM event listener → Supabase
supabase/
  schema.sql                     # Full DB schema with RLS policies
  stats-cron.sql                 # pg_cron job for aggregate stats
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

## 🔒 Security

- **Wallet Connect Only** — No seed phrase input, ever
- **Smart Contract is Source of Truth** — Supabase is display-only mirror
- **Service Role Key** — Never exposed to the client/browser
- **One Claim Per Wallet** — Enforced on-chain via `hasClaimed` mapping
- **ETH Forwarded Immediately** — Payments go directly to treasury multisig

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
