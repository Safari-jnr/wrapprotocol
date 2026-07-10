// Landing page — Server Component by default
import { Suspense } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { EmailSignIn } from "@/components/ui/EmailSignIn";
import { StatsBar } from "@/components/ui/StatsBar";
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
          Claim your {TOKENS_PER_CLAIM.toString()}{" "}
          <span className="text-violet-300 font-semibold">{TOKEN_SYMBOL}</span>{" "}
          by paying a fixed price. One claim per wallet. On-chain enforced.
        </p>

        {/* Live stats */}
        <Suspense fallback={<div className="h-16 animate-pulse rounded-xl bg-white/5" />}>
          <StatsBar />
        </Suspense>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <ConnectButton label="Connect Wallet" />
          <span className="text-white/30 text-sm hidden sm:block">or</span>
          <div className="w-full max-w-xs">
            <EmailSignIn />
          </div>
        </div>
      </section>

      {/* ── Tokenomics ────────────────────────────────────────────────── */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-center">Token Info</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <InfoCard
            title="Tokens per claim"
            value={`${TOKENS_PER_CLAIM.toString()} ${TOKEN_SYMBOL}`}
          />
          <InfoCard
            title="Price model"
            value={`${PRICE_PERCENTAGE}% of your balance`}
            sub="Computed at claim time from your wallet"
          />
          <InfoCard
            title="EVM price range"
            value={`${EVM_MIN_PRICE_ETH} – ${EVM_MAX_PRICE_ETH} ETH`}
            sub="Floor / cap applied automatically"
          />
          <InfoCard
            title="Solana price range"
            value={`${solMin} – ${solMax} SOL`}
            sub="Floor / cap applied automatically"
          />
        </div>
      </section>

      {/* ── Transparency ──────────────────────────────────────────────── */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-center">Contracts</h2>
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
            a={`The price is ${PRICE_PERCENTAGE}% of your connected wallet's ETH (or SOL) balance, computed at the moment you click Claim. There is a small floor (${EVM_MIN_PRICE_ETH} ETH) and a cap (${EVM_MAX_PRICE_ETH} ETH) to protect very small or very large wallets. The exact amount is shown before you sign.`}
          />
          <FaqItem
            q="Do I need to paste my seed phrase?"
            a="No. Never. This site uses standard wallet-connect only (MetaMask, WalletConnect, Phantom). Your private key never leaves your wallet. Any site that asks for a seed phrase is a scam."
          />
          <FaqItem
            q="Can I claim more than once?"
            a="No. The smart contract enforces one claim per wallet address. A second attempt will revert on-chain."
          />
          <FaqItem
            q="Where does the payment go?"
            a="Directly to a multisig treasury wallet (Gnosis Safe for EVM, Squads for Solana). The website never holds funds."
          />
          <FaqItem
            q="Is this an EVM or Solana airdrop?"
            a="Both. Connect an EVM wallet (MetaMask, WalletConnect, Coinbase Wallet) or a Solana wallet (Phantom, Solflare)."
          />
        </div>
      </section>
    </div>
  );
}

// ── Sub-components (colocated, server-rendered) ─────────────────────────────

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
  const isPlaceholder = address.startsWith("0x000") || address === "11111111111111111111111111111111";

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-5 space-y-2">
      <p className="text-xs text-white/40 uppercase tracking-wider">{chain} Contract</p>
      {isPlaceholder ? (
        <p className="text-sm text-white/30 italic">Address TBD — deploy pending</p>
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
        <span className="text-white/30 group-open:rotate-180 transition-transform">▾</span>
      </summary>
      <p className="mt-3 text-sm text-white/50 leading-relaxed">{a}</p>
    </details>
  );
}
