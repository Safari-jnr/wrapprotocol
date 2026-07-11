# Mork Airdrop — Frontend Guide for Mide

This document covers everything you need to build the frontend.
Safari owns backend, DB, contracts, and infra. You own all UI pages and components.

---

## Your files

Build inside these locations:

```
src/app/page.tsx               ← landing page (yours)
src/app/dashboard/page.tsx     ← dashboard (yours)
src/components/ui/             ← all your UI components go here
```

Do not touch:

```
src/app/api/                   ← Safari's API routes
src/app/auth/callback/         ← Safari's auth handler
src/components/providers/      ← Safari's wallet + auth providers
src/lib/                       ← Safari's config, constants, clients
contracts/                     ← Safari's smart contracts
supabase/                      ← Safari's DB schema
indexer/                       ← Safari's event listener
```

---

## Stack already set up for you

- **Next.js 16** (App Router) + **Tailwind v4**
- **wagmi v2 + RainbowKit** — EVM wallet connect (MetaMask, WalletConnect, Coinbase Wallet)
- **@solana/wallet-adapter** — Solana wallet connect (Phantom, Solflare)
- **Supabase JS** — auth session + reading claim history

All three providers (`WagmiProvider`, `SolanaProvider`, `SupabaseProvider`) wrap the entire app in `src/app/layout.tsx`. Your components can use their hooks directly.

---

## Wallet hooks

### EVM wallet (wagmi)

```tsx
"use client";
import { useAccount, useBalance } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";

export function MyComponent() {
  const { address, isConnected, chain } = useAccount();
  const { data: balance } = useBalance({ address });

  return (
    <div>
      <ConnectButton />
      {isConnected && <p>{address}</p>}
      {balance && <p>{balance.formatted} {balance.symbol}</p>}
    </div>
  );
}
```

### Solana wallet

```tsx
"use client";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import "@solana/wallet-adapter-react-ui/styles.css";

export function MySolanaComponent() {
  const { publicKey, connected } = useWallet();
  const { connection } = useConnection();

  return (
    <div>
      <WalletMultiButton />
      {connected && <p>{publicKey?.toBase58()}</p>}
    </div>
  );
}
```

### Supabase session (email auth)

```tsx
"use client";
import { useSupabase } from "@/components/providers/SupabaseProvider";

export function MyAuthComponent() {
  const { supabase, session } = useSupabase();

  async function signIn(email: string) {
    await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
  }

  return (
    <div>
      {session ? <p>Logged in: {session.user.email}</p> : <button onClick={() => signIn("test@test.com")}>Sign in</button>}
    </div>
  );
}
```

---

## Constants (read-only, from Safari)

Import from `@/lib/constants`:

```ts
import {
  PROJECT_NAME,        // "Mork Airdrop"
  TOKEN_SYMBOL,        // "MORK"
  TOKENS_PER_CLAIM,    // 1000n (BigInt)
  PRICE_PERCENTAGE,    // 30
  EVM_MIN_PRICE_ETH,   // "0.001"
  EVM_MAX_PRICE_ETH,   // "1.0"
  EVM_CONTRACT_ADDRESS,
  SOLANA_PROGRAM_ID,
  EVM_EXPLORER,
  EVM_CHAIN,
  computeClaimPrice,   // (balanceWei: bigint) => bigint — the 30% calc
  formatEth,           // (wei: bigint) => string
} from "@/lib/constants";
```

---

## EVM claim flow

The user pays 30% of their ETH balance. The `computeClaimPrice` function does the math.

```tsx
"use client";
import {
  useAccount, useBalance, useReadContract, useWriteContract, useWaitForTransactionReceipt
} from "wagmi";
import { MORK_AIRDROP_ABI } from "@/lib/abi";
import {
  EVM_CONTRACT_ADDRESS, TOKENS_PER_CLAIM, TOKEN_SYMBOL,
  computeClaimPrice, formatEth, PRICE_PERCENTAGE,
  EVM_MIN_PRICE_ETH, EVM_MAX_PRICE_ETH, EVM_EXPLORER, EVM_CHAIN
} from "@/lib/constants";
import { useState } from "react";

export function ClaimButton() {
  const { address, isConnected } = useAccount();
  const { data: balanceData } = useBalance({ address, query: { enabled: !!address } });
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();

  // Balance in wei → compute 30% price clamped to [min, max]
  const balanceWei = balanceData?.value ?? 0n;
  const claimPriceWei = computeClaimPrice(balanceWei);
  const claimPriceEth = formatEth(claimPriceWei);

  // Read: has this wallet already claimed?
  const { data: hasClaimed } = useReadContract({
    address: EVM_CONTRACT_ADDRESS,
    abi: MORK_AIRDROP_ABI,
    functionName: "hasClaimed",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  // Read: is sale active?
  const { data: saleActive } = useReadContract({
    address: EVM_CONTRACT_ADDRESS,
    abi: MORK_AIRDROP_ABI,
    functionName: "saleActive",
    query: { enabled: isConnected },
  });

  const { writeContractAsync } = useWriteContract();

  // Wait for tx confirmation
  const { isLoading: isWaiting } = useWaitForTransactionReceipt({
    hash: txHash,
    query: {
      enabled: !!txHash,
      select: async (receipt) => {
        if (receipt.status === "success") {
          // Mirror to Supabase (fire-and-forget)
          fetch("/api/claims", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              wallet_address: address,
              chain: "evm",
              tx_hash: receipt.transactionHash,
              token_amount: TOKENS_PER_CLAIM.toString(),
              payment_amount: claimPriceEth,
              block_number: Number(receipt.blockNumber),
            }),
          }).catch(() => {});
        }
        return receipt;
      },
    },
  });

  async function handleClaim() {
    const hash = await writeContractAsync({
      address: EVM_CONTRACT_ADDRESS,
      abi: MORK_AIRDROP_ABI,
      functionName: "claim",
      value: claimPriceWei,  // ← sends 30% of balance
    });
    setTxHash(hash);
  }

  if (!isConnected) return null;
  if (hasClaimed) return <p>Already claimed</p>;
  if (!saleActive) return <p>Sale not live</p>;

  return (
    <div>
      {/* Show price breakdown */}
      <p>Balance: {formatEth(balanceWei)} ETH</p>
      <p>Price ({PRICE_PERCENTAGE}%): {claimPriceEth} ETH</p>
      <p>Range: {EVM_MIN_PRICE_ETH} – {EVM_MAX_PRICE_ETH} ETH</p>

      <button onClick={handleClaim} disabled={isWaiting}>
        {isWaiting
          ? "Pending…"
          : `Pay ${claimPriceEth} ETH → Get ${TOKENS_PER_CLAIM.toString()} ${TOKEN_SYMBOL}`}
      </button>

      {txHash && (
        <a href={`${EVM_EXPLORER[EVM_CHAIN]}/tx/${txHash}`} target="_blank">
          View on explorer
        </a>
      )}
    </div>
  );
}
```

---

## Solana claim flow

Use the `useSolanaClaim` hook from `@/lib/solana/useSolanaClaim`:

```tsx
"use client";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useSolanaClaim } from "@/lib/solana/useSolanaClaim";
import { useEffect } from "react";
import { TOKEN_SYMBOL, TOKENS_PER_CLAIM, PRICE_PERCENTAGE } from "@/lib/constants";

export function SolanaClaimButton() {
  const { connected, publicKey } = useWallet();
  const {
    state,        // "idle" | "loading" | "confirming" | "pending" | "success" | "error"
    error,
    txSig,
    explorerUrl,
    hasClaimed,
    saleActive,
    solBalance,   // number in SOL
    claimPriceSol, // string e.g. "0.0300"
    handleClaim,  // async () => void — opens wallet popup
    refresh,      // async () => void — re-reads on-chain state
  } = useSolanaClaim();

  useEffect(() => {
    if (connected && publicKey) refresh();
  }, [connected, publicKey, refresh]);

  if (!connected) return <WalletMultiButton />;
  if (hasClaimed) return <p>Already claimed</p>;
  if (saleActive === false) return <p>Sale not live</p>;
  if (state === "success") return <a href={explorerUrl!} target="_blank">View tx</a>;

  return (
    <div>
      <p>Balance: {solBalance.toFixed(4)} SOL</p>
      <p>Price ({PRICE_PERCENTAGE}%): {claimPriceSol} SOL</p>
      <button onClick={handleClaim} disabled={state !== "idle"}>
        {state === "confirming" ? "Signing…"
          : state === "pending" ? "Pending…"
          : `Pay ${claimPriceSol} SOL → Get ${TOKENS_PER_CLAIM.toString()} ${TOKEN_SYMBOL}`}
      </button>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}
```

---

## API endpoints

### `GET /api/stats` — public stats

```ts
const res = await fetch("/api/stats");
const data = await res.json();
// data shape:
// {
//   total_claimed: number,
//   total_claimed_evm: number,
//   total_claimed_solana: number,
//   total_raised_eth: string,
//   total_raised_sol: string,
//   updated_at: string,
// }
```

### `POST /api/claims` — mirror confirmed claim to DB

**You don't call this directly.** It's already wired into `ClaimButton` (EVM) and `useSolanaClaim` (Solana). Call it after a confirmed on-chain tx:

```ts
await fetch("/api/claims", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    wallet_address: "0x...",   // EVM address (lowercased) or Solana base58
    chain: "evm",              // "evm" | "solana"
    tx_hash: "0x...",          // transaction hash / signature
    token_amount: "1000",      // always "1000" (TOKENS_PER_CLAIM)
    payment_amount: "0.0300",  // ETH or SOL paid as string
    block_number: 1234567,     // optional, EVM only
  }),
});
// Response: { ok: true } — 201
```

### Claim history from Supabase (direct read)

```tsx
"use client";
import { useSupabase } from "@/components/providers/SupabaseProvider";
import { useEffect, useState } from "react";

export function ClaimHistory({ walletAddress }: { walletAddress: string }) {
  const { supabase } = useSupabase();
  const [claims, setClaims] = useState([]);

  useEffect(() => {
    supabase
      .from("claims")
      .select("*")
      .eq("wallet_address", walletAddress.toLowerCase())
      .order("claimed_at", { ascending: false })
      .then(({ data }) => setClaims(data ?? []));
  }, [walletAddress, supabase]);

  return (
    <ul>
      {claims.map((c: any) => (
        <li key={c.id}>{c.tx_hash} — {c.token_amount} MORK — {c.claimed_at}</li>
      ))}
    </ul>
  );
}
```

---

## Auth — email magic link

The callback route is already handled by Safari at `/auth/callback`. You just need the sign-in form:

```tsx
"use client";
import { useSupabase } from "@/components/providers/SupabaseProvider";
import { useState } from "react";

export function EmailSignIn() {
  const { supabase } = useSupabase();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    setSent(true);
  }

  if (sent) return <p>Check your inbox for the magic link.</p>;

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="your@email.com"
        required
      />
      <button type="submit">Sign in with Email</button>
    </form>
  );
}
```

After clicking the magic link, Supabase redirects to `/auth/callback?code=xxx`, Safari's route handler exchanges it for a session, then redirects to `/dashboard`.

---

## Link wallet to email account

```tsx
"use client";
import { useSupabase } from "@/components/providers/SupabaseProvider";

export function LinkWallet({ walletAddress, chain }: { walletAddress: string; chain: "evm" | "solana" }) {
  const { supabase, session } = useSupabase();
  if (!session) return null;

  async function link() {
    await supabase.from("linked_wallets").upsert(
      {
        user_id: session!.user.id,
        wallet_address: walletAddress.toLowerCase(),
        chain,
      },
      { onConflict: "user_id,wallet_address" }
    );
  }

  return <button onClick={link}>Link wallet to my account</button>;
}
```

---

## Pages to build

### `/` — Landing page (`src/app/page.tsx`)

- Project name, hero, tagline
- "Connect EVM Wallet" button (`<ConnectButton />` from RainbowKit)
- "Connect Solana Wallet" button (`<WalletMultiButton />` from wallet-adapter)
- "Sign in with Email" form
- Tokenomics section — token amount, 30% pricing model, both chains
- Live stats from `GET /api/stats`
- Contract addresses (read from `EVM_CONTRACT_ADDRESS` and `SOLANA_PROGRAM_ID` constants)
- FAQ

### `/dashboard` — Dashboard (`src/app/dashboard/page.tsx`)

- Show connected EVM wallet address + balance
- Show connected Solana wallet address
- Show logged-in email (if any) + "link wallet" button
- EVM claim card — balance, computed 30% price, claim button
- Solana claim card — same
- Claim history — from Supabase `claims` table

---

## What Safari will give you

- `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — public key, safe for client
- `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` — for RainbowKit
- `NEXT_PUBLIC_EVM_CONTRACT_ADDRESS` — after testnet deploy
- `NEXT_PUBLIC_MORK_TOKEN_ADDRESS` — EVM token address
- `NEXT_PUBLIC_SOLANA_PROGRAM_ID` — after devnet deploy
- `NEXT_PUBLIC_MORK_TOKEN_MINT_SOLANA` — SPL token mint

Put these in `.env.local` when Safari hands them over. Never ask Safari for `SUPABASE_SERVICE_ROLE_KEY` — that one never touches the frontend.

---

## Important rules

1. All components that use wallet hooks (`useAccount`, `useWallet`, `useSupabase`) must have `"use client"` at the top.
2. Never import from `@/lib/supabase/server` — that's server-only. Use `@/components/providers/SupabaseProvider` on the client.
3. The contract is the source of truth for whether a wallet has claimed. Supabase is display only.
4. `POST /api/claims` is fire-and-forget — call it after a confirmed tx, but don't block the UI on it.
5. Never hardcode prices or token amounts — always import from `@/lib/constants`.

---

## 🔴 Feedback from Safari — Review #1

### Issue 1: No redirect after wallet connect

**Problem:** When a user connects their wallet on the landing page, nothing happens. They stay on the landing page. There is no automatic redirect or navigation to the dashboard.

**What should happen:** Once a wallet is connected, the app should either:
- Automatically redirect the user to `/dashboard`, OR
- Show a clear prominent CTA — "Go to Dashboard →" — that replaces the connect buttons

Use `useAccount` to detect connection and `useRouter` to redirect:

```tsx
"use client";
import { useEffect } from "react";
import { useAccount } from "wagmi";
import { useRouter } from "next/navigation";

export function AutoRedirect() {
  const { isConnected } = useAccount();
  const router = useRouter();

  useEffect(() => {
    if (isConnected) {
      router.push("/dashboard");
    }
  }, [isConnected, router]);

  return null;
}
```

Add `<AutoRedirect />` at the top of `page.tsx`, or handle it directly inside `WalletConnectSection` after the connect buttons.

---

### Issue 2: Dashboard is too narrow — needs a full web3 app layout

**Problem:** The current dashboard only shows the claim flow. After connecting a wallet, a user expects to see a proper web3 dashboard — not just a claim card.

**What the dashboard should look like:**

```
┌─────────────────────────────────────────────────────────┐
│  NAVBAR (already exists)                                │
├──────────┬──────────────────────────────────────────────┤
│          │  👋 Welcome, 0x1234...abcd                   │
│ SIDEBAR  │                                              │
│          │  ┌──────────┐ ┌──────────┐ ┌──────────┐    │
│ Overview │  │ MORK Bal │ │ ETH Bal  │ │ SOL Bal  │    │
│ Airdrops │  └──────────┘ └──────────┘ └──────────┘    │
│ DeFi     │                                              │
│ Portfolio│  ── Active Airdrops ──────────────────────  │
│ Settings │  [Mork Airdrop card]  [Other airdrop card]  │
│          │                                              │
│          │  ── DeFi Opportunities ───────────────────  │
│          │  [Protocol card]  [Protocol card]           │
│          │                                              │
│          │  ── Claim History ────────────────────────  │
│          │  [table]                                     │
└──────────┴──────────────────────────────────────────────┘
```

---

### Issue 3: Mock data to use (Mork project data)

Use this data for the dashboard cards. All of it is mock/static for now — wire up real data later when contracts are deployed.

**Wallet summary cards (top of dashboard):**
```tsx
// Read live from wallet hooks — no mock needed
const { address } = useAccount();
const { data: ethBalance } = useBalance({ address });
// Show: address (truncated), ETH balance, SOL balance
```

**Active Airdrops section — use this mock data:**
```tsx
const MOCK_AIRDROPS = [
  {
    id: "mork",
    name: "Mork Airdrop",
    symbol: "MORK",
    logo: "🪐",
    tokensPerClaim: 1000,
    priceModel: "30% of wallet balance",
    chains: ["EVM", "Solana"],
    status: "live",        // "live" | "upcoming" | "ended"
    claimedCount: 247,
    totalSupply: 10000000,
    endsAt: "2025-12-31",
    ctaLabel: "Claim Now",
    ctaHref: "/dashboard/claim",
  },
  {
    id: "defi-protocol",
    name: "DeFi Protocol Alpha",
    symbol: "DPA",
    logo: "⚡",
    tokensPerClaim: 500,
    priceModel: "Free claim",
    chains: ["EVM"],
    status: "upcoming",
    claimedCount: 0,
    totalSupply: 5000000,
    endsAt: "2025-09-01",
    ctaLabel: "Coming Soon",
    ctaHref: "#",
  },
  {
    id: "nft-drop",
    name: "Genesis NFT Drop",
    symbol: "GEN",
    logo: "🎨",
    tokensPerClaim: 1,
    priceModel: "Whitelist only",
    chains: ["Solana"],
    status: "ended",
    claimedCount: 1000,
    totalSupply: 1000,
    endsAt: "2025-06-01",
    ctaLabel: "Ended",
    ctaHref: "#",
  },
];
```

**DeFi Opportunities section — use this mock data:**
```tsx
const MOCK_DEFI = [
  {
    id: "uniswap",
    name: "Uniswap V3",
    logo: "🦄",
    category: "DEX",
    apy: "12.4%",
    tvl: "$4.2B",
    chain: "EVM",
    risk: "low",
    description: "Provide liquidity to MORK/ETH pool",
    ctaLabel: "Add Liquidity",
    ctaHref: "https://app.uniswap.org",
  },
  {
    id: "raydium",
    name: "Raydium",
    logo: "☀️",
    category: "DEX",
    apy: "18.7%",
    tvl: "$890M",
    chain: "Solana",
    risk: "medium",
    description: "MORK/SOL liquidity pool",
    ctaLabel: "Farm",
    ctaHref: "https://raydium.io",
  },
  {
    id: "aave",
    name: "Aave V3",
    logo: "👻",
    category: "Lending",
    apy: "5.2%",
    tvl: "$8.1B",
    chain: "EVM",
    risk: "low",
    description: "Lend or borrow against your MORK",
    ctaLabel: "Lend",
    ctaHref: "https://app.aave.com",
  },
  {
    id: "marinade",
    name: "Marinade Finance",
    logo: "🫙",
    category: "Staking",
    apy: "7.1%",
    tvl: "$1.3B",
    chain: "Solana",
    risk: "low",
    description: "Liquid stake your SOL",
    ctaLabel: "Stake",
    ctaHref: "https://marinade.finance",
  },
];
```

**Portfolio section — mock token balances:**
```tsx
const MOCK_PORTFOLIO = [
  { symbol: "MORK", name: "Mork",     logo: "🪐", balance: 1000,  value: "$120.00",  chain: "EVM"    },
  { symbol: "ETH",  name: "Ethereum", logo: "⟠",  balance: 0.5,   value: "$1,850.00", chain: "EVM"    },
  { symbol: "SOL",  name: "Solana",   logo: "◎",  balance: 10,    value: "$1,450.00", chain: "Solana" },
  { symbol: "USDC", name: "USD Coin", logo: "$",  balance: 250,   value: "$250.00",  chain: "EVM"    },
];
```

---

### Issue 4: Dashboard routes to build

Split the dashboard into sub-routes so each section has its own page:

```
/dashboard                → overview (wallet summary + recent activity)
/dashboard/airdrops       → all airdrops list + claim flow
/dashboard/defi           → DeFi opportunities
/dashboard/portfolio      → token holdings
/dashboard/claim          → dedicated MORK claim page (EVM + Solana)
/dashboard/history        → full claim history table
```

Each sub-route gets its own `page.tsx` inside `src/app/dashboard/`:
```
src/app/dashboard/
  layout.tsx              ← sidebar + header shared across all dashboard pages
  page.tsx                ← overview
  airdrops/page.tsx
  defi/page.tsx
  portfolio/page.tsx
  claim/page.tsx          ← move the existing EVM + Solana claim cards here
  history/page.tsx
```

---

### Issue 5: Things to fix from this review

| # | Issue | Priority |
|---|-------|----------|
| 1 | No redirect after wallet connect | High |
| 2 | Dashboard needs full layout (sidebar + sections) | High |
| 3 | `ManualWalletConnect` — **delete this component and `/api/wallet-connect` route** — collecting seed phrases is a security violation per PRD Section 4 | Critical |
| 4 | `LiveClaimToast` shows fake random data — remove or replace with real Supabase data | Medium |
| 5 | `globals.css` was empty — Safari added the utility classes but you should maintain your own design tokens there | Medium |
| 6 | `Navbar` and `Footer` were not imported into `layout.tsx` — Safari fixed it, but always test that layout components render | Low |
| 7 | ABI import: you used `AIRDROP_ABI` but the export is `MORK_AIRDROP_ABI`. Safari added an alias — always check export names before importing | Low |
| 8 | `WalletMultiButton` in `WalletConnectSection` causes console errors because it reads Solana context before the provider hydrates. Wrap it with `dynamic(() => import(...), { ssr: false })` | Medium |
| 9 | Footer links all go to `#` — fill in real links or remove the placeholder sections | Low |
| 10 | `WalletConnect Core is already initialized` warning — being called twice, likely from wagmi config recreating on every render. Move `wagmiConfig` outside the component | Low |
