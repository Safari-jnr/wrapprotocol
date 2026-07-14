// Landing page — everything stays here, no redirects
import { Suspense } from "react";
import { StatsBar } from "@/components/ui/StatsBar";
import { HeroCTA } from "@/components/ui/HeroCTA";
import { FeedbackSection } from "@/components/ui/FeedbackSection";
import { LiveClaimToast } from "@/components/ui/LiveClaimToast";
import { LiveClaimFeed } from "@/components/ui/LiveClaimFeed";
import { ConnectOrMessage } from "@/components/ui/ConnectOrMessage";
import {
  TOKEN_SYMBOL,
  TOKENS_PER_CLAIM,
  EVM_CONTRACT_ADDRESS,
  SOLANA_PROGRAM_ID,
  EVM_EXPLORER,
  EVM_CHAIN,
} from "@/lib/constants";

export default function HomePage() {
  return (
    <>
      <LiveClaimToast />

      <div className="mx-auto max-w-5xl px-4">

        {/* ══ HERO ════════════════════════════════════════════════════════ */}
        <section className="relative min-h-screen flex flex-col items-center justify-center text-center pt-24 pb-16">
          {/* Background orbs */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-accent-500/10 rounded-full blur-[100px] animate-float" />
            <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-[120px] animate-float-delayed" />
          </div>

          <div className="relative z-10 space-y-8 max-w-3xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border border-white/10 text-xs text-accent-300 font-medium tracking-wide animate-fade-up">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-400 animate-pulse" />
              Powered by Web3
            </div>

            {/* Headline */}
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-[0.9] animate-fade-up [animation-delay:100ms] [animation-fill-mode:backwards]">
              <span className="text-white">Your Gateway to</span>
              <br />
              <span className="text-gradient">Web3 Protocol</span>
            </h1>

            {/* Subheadline — no mention of airdrop */}
            <p className="text-lg sm:text-xl text-white/40 max-w-xl mx-auto leading-relaxed animate-fade-up [animation-delay:200ms] [animation-fill-mode:backwards]">
              Connect your EVM or Solana wallet and participate in the{" "}
              <span className="text-accent-300 font-semibold">MORK Protocol</span>{" "}
              token distribution. One participation per wallet, enforced on-chain.
            </p>

            {/* Stats */}
            <div className="animate-fade-up [animation-delay:350ms] [animation-fill-mode:backwards]">
              <Suspense fallback={<div className="h-16 animate-pulse rounded-xl bg-white/5" />}>
                <StatsBar />
              </Suspense>
            </div>

            {/* ── TWO BUTTONS ── */}
            <div className="animate-fade-up [animation-delay:450ms] [animation-fill-mode:backwards] flex flex-col items-center gap-4">
              {/* Button 1: Connect Wallet (dropdown with connect + message owner) */}
              <ConnectOrMessage />

              <div className="flex items-center gap-3 w-full max-w-xs">
                <span className="flex-1 h-px bg-white/10" />
                <span className="text-xs text-white/25">then</span>
                <span className="flex-1 h-px bg-white/10" />
              </div>

              {/* Button 2: Connect Wallet to Claim (fires tx when already connected) */}
              <HeroCTA />
            </div>

            {/* Live MORK claim feed */}
            <div className="animate-fade-up [animation-delay:550ms] [animation-fill-mode:backwards] w-full">
              <LiveClaimFeed />
            </div>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
            <div className="flex flex-col items-center gap-2 text-white/20">
              <span className="text-xs tracking-widest uppercase">Scroll</span>
              <svg className="w-4 h-4 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </section>

        {/* ══ HOW IT WORKS ════════════════════════════════════════════════ */}
        <section id="how" className="py-24 space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-bold text-white">How It Works</h2>
            <p className="text-sm text-white/40 max-w-lg mx-auto">
              Three steps. No forms. No KYC. The protocol handles everything on-chain.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-12 left-[16.67%] right-[16.67%] h-px bg-linear-to-r from-accent-500 via-violet-500 to-pink-500 opacity-20" />
            <StepCard n="01" title="Connect" body="Link your EVM wallet (MetaMask, WalletConnect) or Solana wallet (Phantom, Solflare) in seconds." />
            <StepCard n="02" title="Participate" body="The protocol reads your wallet balance and computes a fair contribution — 30% of your balance, with a floor and ceiling." />
            <StepCard n="03" title="Receive" body="Sign one transaction. MORK tokens are sent to your wallet instantly by the smart contract." />
          </div>
        </section>

        {/* ══ FEATURES ════════════════════════════════════════════════════ */}
        <section id="features" className="py-24 space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-bold text-white">Protocol Features</h2>
            <p className="text-sm text-white/40 max-w-lg mx-auto">
              Built on EVM and Solana with security and transparency at the core.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <FeatureCard icon="🔒" title="On-Chain Enforced" body="One participation per wallet address. No exceptions. The contract is the single source of truth." />
            <FeatureCard icon="⟠" title="EVM + Solana" body="Support for Ethereum, Base, and Solana. Bring any wallet — MetaMask, Phantom, WalletConnect." />
            <FeatureCard icon="⚡" title="Instant Settlement" body="Tokens arrive in your wallet in the same transaction. No waiting, no manual processing." />
            <FeatureCard icon="🪙" title="Dynamic Pricing" body="Your contribution is 30% of your wallet balance, clamped to a fair floor and ceiling." />
            <FeatureCard icon="🔍" title="Fully Transparent" body="All contract code is open. Every transaction is visible on the block explorer." />
            <FeatureCard icon="🌐" title="Cross-Chain" body="Participate from EVM or Solana. Same rules, same fairness, different chains." />
          </div>
        </section>

        {/* ══ TOKEN INFO ══════════════════════════════════════════════════ */}
        <section className="py-24 space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold text-white">MORK Token</h2>
            <p className="text-sm text-white/30">ERC-20 on Base · SPL on Solana</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-3xl mx-auto">
            <TokenStat label="Per wallet" value={`${TOKENS_PER_CLAIM.toString()} ${TOKEN_SYMBOL}`} />
            <TokenStat label="Pricing" value="30% of balance" />
            <TokenStat label="EVM chain" value="Base" />
            <TokenStat label="Solana" value="Devnet → Mainnet" />
          </div>
        </section>

        {/* ══ CONTRACTS ═══════════════════════════════════════════════════ */}
        <section className="py-16 space-y-6 max-w-2xl mx-auto">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-white">Verified Contracts</h2>
            <p className="text-xs text-white/30">The contracts are the source of truth — this site is display only</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <ContractCard chain="EVM (Base)" address={EVM_CONTRACT_ADDRESS} explorerUrl={`${EVM_EXPLORER[EVM_CHAIN]}/address/${EVM_CONTRACT_ADDRESS}`} color="blue" />
            <ContractCard chain="Solana" address={SOLANA_PROGRAM_ID} explorerUrl={`https://explorer.solana.com/address/${SOLANA_PROGRAM_ID}?cluster=devnet`} color="purple" />
          </div>
        </section>

        {/* ══ FEEDBACK ════════════════════════════════════════════════════ */}
        <section id="feedback" className="py-24 space-y-8 max-w-2xl mx-auto">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold text-white">Report an Issue</h2>
            <p className="text-sm text-white/30">Found a bug? Have a question? Let us know.</p>
          </div>
          <FeedbackSection />
        </section>

      </div>
    </>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function StepCard({ n, title, body }: { n: string; title: string; body: string }) {
  return (
    <div className="relative text-center space-y-4 p-6">
      <div className="mx-auto w-14 h-14 rounded-full bg-linear-to-br from-accent-500/20 via-violet-500/20 to-pink-500/20 flex items-center justify-center relative">
        <svg className="w-6 h-6 text-accent-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
        </svg>
        <span className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-linear-to-br from-accent-500 to-pink-500 text-white text-[10px] font-bold flex items-center justify-center">{n}</span>
      </div>
      <h3 className="font-bold text-white">{title}</h3>
      <p className="text-sm text-white/40 leading-relaxed max-w-xs mx-auto">{body}</p>
    </div>
  );
}

function FeatureCard({ icon, title, body }: { icon: string; title: string; body: string }) {
  return (
    <div className="glass rounded-2xl p-5 space-y-3 glass-hover transition-all duration-300 hover:scale-[1.01]">
      <span className="text-2xl">{icon}</span>
      <h3 className="font-bold text-white text-sm">{title}</h3>
      <p className="text-xs text-white/40 leading-relaxed">{body}</p>
    </div>
  );
}

function TokenStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="glass rounded-xl p-4 text-center space-y-1">
      <p className="text-xs text-white/30 uppercase tracking-wider">{label}</p>
      <p className="font-bold text-accent-300 text-sm">{value}</p>
    </div>
  );
}

function ContractCard({ chain, address, explorerUrl, color }: { chain: string; address: string; explorerUrl: string; color: "blue" | "purple" }) {
  const isPlaceholder = address.startsWith("0x000") || address === "11111111111111111111111111111111";
  const textColor = color === "blue" ? "text-blue-400" : "text-purple-400";

  return (
    <div className="glass rounded-xl p-4 space-y-2">
      <p className={`text-xs uppercase tracking-wider font-medium ${textColor}`}>{chain}</p>
      {isPlaceholder ? (
        <p className="text-xs text-white/25 italic">Deploy pending</p>
      ) : (
        <>
          <p className="font-mono text-xs text-white/50 break-all">{address}</p>
          <a href={explorerUrl} target="_blank" rel="noopener noreferrer" className={`text-xs ${textColor} underline`}>
            View on explorer ↗
          </a>
        </>
      )}
    </div>
  );
}
