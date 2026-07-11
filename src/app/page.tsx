// Landing page — Server Component
import { Suspense } from "react";
import Link from "next/link";
import { StatsBar } from "@/components/ui/StatsBar";
import { LandingCTAs } from "@/components/ui/LandingCTAs";
import {
  PROJECT_NAME,
  TOKEN_SYMBOL,
  TOKENS_PER_CLAIM,
  EVM_CONTRACT_ADDRESS,
  SOLANA_PROGRAM_ID,
  EVM_EXPLORER,
  EVM_CHAIN,
  PRICE_PERCENTAGE,
  EVM_MIN_PRICE_ETH,
  EVM_MAX_PRICE_ETH,
  SOL_MIN_PRICE_LAMPORTS,
  SOL_MAX_PRICE_LAMPORTS,
} from "@/lib/constants";

export default function HomePage() {
  const solMin = (SOL_MIN_PRICE_LAMPORTS / 1e9).toFixed(3);
  const solMax = (SOL_MAX_PRICE_LAMPORTS / 1e9).toFixed(1);

  return (
    <div className="mx-auto max-w-4xl px-4 py-16 space-y-24">

      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <section className="text-center space-y-6">
        <div className="text-6xl">🪐</div>
        <h1 className="text-5xl font-extrabold tracking-tight bg-linear-to-r from-violet-400 to-indigo-300 bg-clip-text text-transparent">
          {PROJECT_NAME}
        </h1>
        <p className="text-xl text-white/60 max-w-lg mx-auto">
          Claim your{" "}
          <span className="text-violet-300 font-semibold">
            {TOKENS_PER_CLAIM.toString()} {TOKEN_SYMBOL}
          </span>{" "}
          by paying {PRICE_PERCENTAGE}% of your wallet balance.
          One claim per wallet. On-chain enforced. EVM + Solana.
        </p>

        {/* Live stats */}
        <Suspense
          fallback={
            <div className="h-16 animate-pulse rounded-xl bg-white/5" />
          }
        >
          <StatsBar />
        </Suspense>

        {/* CTAs — client component (needs wallet hooks) */}
        <LandingCTAs />
      </section>

      {/* ── How it works ──────────────────────────────────────────────── */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-center">How it works</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          <StepCard
            n="1"
            title="Connect wallet"
            body="Connect MetaMask, WalletConnect, or Coinbase Wallet for EVM — or Phantom / Solflare for Solana."
          />
          <StepCard
            n="2"
            title="Price is computed"
            body={`We calculate ${PRICE_PERCENTAGE}% of your wallet balance. You see the exact amount before signing — no surprises.`}
          />
          <StepCard
            n="3"
            title="Sign & receive"
            body={`One transaction. The contract sends ${TOKENS_PER_CLAIM.toString()} ${TOKEN_SYMBOL} to your wallet instantly.`}
          />
        </div>
        <div className="text-center pt-2">
          <Link
            href="/dashboard"
            className="inline-block rounded-xl bg-violet-600 px-8 py-3 font-bold text-white hover:bg-violet-500 transition-colors"
          >
            Go to Dashboard →
          </Link>
        </div>
      </section>

      {/* ── Token Info ────────────────────────────────────────────────── */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-center">Token Info</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <InfoCard
            title="Tokens per claim"
            value={`${TOKENS_PER_CLAIM.toString()} ${TOKEN_SYMBOL}`}
            sub="Same amount on all chains"
          />
          <InfoCard
            title="Price model"
            value={`${PRICE_PERCENTAGE}% of your balance`}
            sub="Computed at claim time"
          />
          <InfoCard
            title="EVM price range"
            value={`${EVM_MIN_PRICE_ETH} – ${EVM_MAX_PRICE_ETH} ETH`}
            sub={`${EVM_CHAIN.charAt(0).toUpperCase() + EVM_CHAIN.slice(1)} · floor / cap`}
          />
          <InfoCard
            title="Solana price range"
            value={`${solMin} – ${solMax} SOL`}
            sub="Devnet/Mainnet · floor / cap"
          />
        </div>
      </section>

      {/* ── Contracts ─────────────────────────────────────────────────── */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-center">Contracts</h2>
        <p className="text-center text-sm text-white/40">
          The contract is the source of truth — this site is a display layer only.
        </p>
        <div className="grid sm:grid-cols-2 gap-4">
          <ContractCard
            chain="EVM"
            address={EVM_CONTRACT_ADDRESS}
            explorerUrl={`${EVM_EXPLORER[EVM_CHAIN]}/address/${EVM_CONTRACT_ADDRESS}`}
          />
          <ContractCard
            chain="Solana"
            address={SOLANA_PROGRAM_ID}
            explorerUrl={`https://explorer.solana.com/address/${SOLANA_PROGRAM_ID}?cluster=devnet`}
          />
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────────────── */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-center">FAQ</h2>
        <div className="space-y-3">
          <FaqItem
            q="How much do I pay?"
            a={`${PRICE_PERCENTAGE}% of your connected wallet's balance (ETH or SOL), computed the moment you click Claim. There's a floor (${EVM_MIN_PRICE_ETH} ETH / ${solMin} SOL) and a cap (${EVM_MAX_PRICE_ETH} ETH / ${solMax} SOL). The exact amount is shown before you sign.`}
          />
          <FaqItem
            q="Can I claim on both EVM and Solana?"
            a="Yes — EVM and Solana are tracked separately. You can claim once on EVM with a connected EVM wallet, and once on Solana with a connected Solana wallet."
          />
          <FaqItem
            q="Do I need to paste my seed phrase?"
            a="No. Never. This site uses standard wallet-connect only. Your private key never leaves your wallet. Any site that asks for a seed phrase is a scam."
          />
          <FaqItem
            q="Can I claim more than once?"
            a="No. The smart contract enforces one claim per wallet address. A second attempt reverts on-chain."
          />
          <FaqItem
            q="Where does my payment go?"
            a="Directly to the project treasury wallet in the same transaction. This contract never holds funds."
          />
        </div>
      </section>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function StepCard({ n, title, body }: { n: string; title: string; body: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-5 space-y-2">
      <div className="w-7 h-7 rounded-full bg-violet-600 flex items-center justify-center text-xs font-bold text-white">
        {n}
      </div>
      <p className="font-semibold text-white">{title}</p>
      <p className="text-sm text-white/50 leading-relaxed">{body}</p>
    </div>
  );
}

function InfoCard({
  title,
  value,
  sub,
}: {
  title: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-5 text-center space-y-1">
      <p className="text-xs text-white/40 uppercase tracking-wider">{title}</p>
      <p className="text-xl font-bold text-violet-300">{value}</p>
      {sub && <p className="text-xs text-white/30">{sub}</p>}
    </div>
  );
}

function ContractCard({
  chain,
  address,
  explorerUrl,
}: {
  chain: string;
  address: string;
  explorerUrl: string;
}) {
  const isPlaceholder =
    address.startsWith("0x000") ||
    address === "11111111111111111111111111111111";

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-5 space-y-2">
      <p className="text-xs text-white/40 uppercase tracking-wider">
        {chain} Contract
      </p>
      {isPlaceholder ? (
        <p className="text-sm text-white/30 italic">
          Address TBD — deploy pending
        </p>
      ) : (
        <>
          <p className="font-mono text-xs text-white/70 break-all">{address}</p>
          <a
            href={explorerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-violet-400 underline"
          >
            View on explorer ↗
          </a>
        </>
      )}
    </div>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  return (
    <details className="group rounded-xl border border-white/10 bg-white/5 px-5 py-4 cursor-pointer">
      <summary className="font-semibold text-white/80 list-none flex justify-between items-center">
        {q}
        <span className="text-white/30 group-open:rotate-180 transition-transform">
          ▾
        </span>
      </summary>
      <p className="mt-3 text-sm text-white/50 leading-relaxed">{a}</p>
    </details>
  );
}
