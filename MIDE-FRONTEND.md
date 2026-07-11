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
