// Landing page — Server Component by default
import { Suspense } from "react";
import { StatsBar } from "@/components/ui/StatsBar";
import { WalletConnectSection } from "@/components/ui/WalletConnectSection";
import { FeedbackSection } from "@/components/ui/FeedbackSection";
import { LiveClaimToast } from "@/components/ui/LiveClaimToast";
import {
  PROJECT_NAME,
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
      {/* Live claim notifications */}
      <LiveClaimToast />

      <div className="mx-auto max-w-6xl px-4">

        {/* ══════════════════════════════════════════════════════════════
            HERO SECTION
           ══════════════════════════════════════════════════════════════ */}
        <section className="relative min-h-screen flex flex-col items-center justify-center text-center pt-24 pb-16">
          {/* Animated gradient orbs */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-accent-500/10 rounded-full blur-[100px] animate-float" />
            <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-[120px] animate-float-delayed" />
            <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-pink-500/8 rounded-full blur-[90px] animate-float" style={{ animationDelay: "4s" }} />
          </div>

          <div className="relative z-10 space-y-8 max-w-4xl mx-auto">
            {/* Badge pill */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border border-white/10 text-xs text-accent-300 font-medium tracking-wide animate-fade-up">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-400 animate-pulse" />
              Powered by Web3
            </div>

            {/* Main headline */}
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold tracking-tight leading-[0.9] animate-fade-up [animation-delay:100ms] [animation-fill-mode:backwards]">
              <span className="text-white">Claim Your</span>
              <br />
              <span className="text-gradient">Airdrop</span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg sm:text-xl md:text-2xl text-white/40 max-w-2xl mx-auto leading-relaxed animate-fade-up [animation-delay:200ms] [animation-fill-mode:backwards]">
              Connect your wallet, check eligibility, and claim your{" "}
              <span className="text-accent-300 font-semibold">
                {TOKENS_PER_CLAIM.toString()} {TOKEN_SYMBOL}
              </span>{" "}
              tokens. One claim per wallet. On-chain enforced on{" "}
              <span className="text-white/60">EVM</span> +{" "}
              <span className="text-white/60">Solana</span>.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-up [animation-delay:300ms] [animation-fill-mode:backwards]">
              <a
                href="/dashboard"
                className="group relative inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-accent-500 via-violet-500 to-pink-500 px-8 py-4 text-base font-bold text-white transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-accent-500/30"
              >
                Claim Airdrop
                <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </a>
              <a
                href="#features"
                className="inline-flex items-center gap-2 rounded-full glass border border-white/10 px-8 py-4 text-base font-medium text-white/70 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all duration-300"
              >
                Learn More
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </a>
            </div>

            {/* Stats row */}
            <div className="pt-8 animate-fade-up [animation-delay:400ms] [animation-fill-mode:backwards]">
              <Suspense
                fallback={
                  <div className="flex justify-center gap-8">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="h-16 w-28 animate-pulse rounded-xl bg-white/5 animate-shimmer" />
                    ))}
                  </div>
                }
              >
                <StatsBar />
              </Suspense>
            </div>

            {/* CTA — Wallet Connect + Email Sign In (client component) */}
            <div className="pt-4 animate-fade-up [animation-delay:500ms] [animation-fill-mode:backwards]">
              <WalletConnectSection />
            </div>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-fade-in [animation-delay:1s] [animation-fill-mode:backwards]">
            <div className="flex flex-col items-center gap-2 text-white/20">
              <span className="text-xs tracking-widest uppercase">Scroll</span>
              <svg className="w-4 h-4 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════
            FEATURES SECTION
           ══════════════════════════════════════════════════════════════ */}
        <section id="features" className="py-24 space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-3xl sm:text-4xl font-bold text-white">
              Everything You Need in Web3
            </h2>
            <p className="text-base text-white/40 max-w-xl mx-auto">
              From wallet tracking to airdrop claims — all in one unified platform.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <FeatureCard
              icon={<WalletIcon />}
              title="Wallet Tracking"
              description="Monitor all your wallets in one unified dashboard across EVM and Solana."
            />
            <FeatureCard
              icon={<SearchIcon />}
              title="DAO Discovery"
              description="Find and connect with the most active decentralized communities."
            />
            <FeatureCard
              icon={<ShieldIcon />}
              title="Secure Claims"
              description="On-chain enforced one-claim-per-wallet. Your funds never touch our servers."
            />
            <FeatureCard
              icon={<ZapIcon />}
              title="Live Notifications"
              description="Real-time claim notifications showing recent airdrop activity."
            />
            <FeatureCard
              icon={<ChartIcon />}
              title="Airdrop Analytics"
              description="Track distribution stats, claim rates, and wallet activity."
            />
            <FeatureCard
              icon={<GlobeIcon />}
              title="Cross-Chain"
              description="Support for Ethereum, Solana, Base, and more coming soon."
            />
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════
            HOW IT WORKS
           ══════════════════════════════════════════════════════════════ */}
        <section className="py-24 space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-3xl sm:text-4xl font-bold text-white">How It Works</h2>
            <p className="text-base text-white/40 max-w-xl mx-auto">
              Three simple steps to claim your tokens.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-12 left-[16.67%] right-[16.67%] h-px bg-gradient-to-r from-accent-500 via-violet-500 to-pink-500 opacity-30" />

            <StepCard
              number="01"
              title="Connect"
              description="Link your EVM or Solana wallet in seconds. Supported wallets include MetaMask, Phantom, and WalletConnect."
              icon={<WalletIcon />}
            />
            <StepCard
              number="02"
              title="Check Eligibility"
              description="Verify your wallet eligibility on-chain. The contract reads your balance and computes the price automatically."
              icon={<SearchIcon />}
            />
            <StepCard
              number="03"
              title="Claim & Earn"
              description="Pay the dynamic price based on your wallet balance and receive your tokens instantly. One claim per wallet."
              icon={<ZapIcon />}
            />
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════
            AIRDROP CTA BANNER
           ══════════════════════════════════════════════════════════════ */}
        <section className="py-16">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-accent-600 via-violet-600 to-pink-600 p-8 sm:p-12 text-center space-y-6">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-32 h-32 bg-white rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
              <div className="absolute bottom-0 right-0 w-48 h-48 bg-white rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />
            </div>
            
            <div className="relative z-10 space-y-4">
              <h2 className="text-3xl sm:text-4xl font-bold text-white">
                Ready to Claim Your Airdrop?
              </h2>
              <p className="text-lg text-white/70 max-w-lg mx-auto">
                Join thousands of users claiming their tokens. Connect your wallet and check eligibility now.
              </p>
              <a
                href="/dashboard"
                className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-3.5 text-base font-bold text-violet-700 hover:bg-white/90 hover:scale-105 transition-all duration-300 shadow-xl"
              >
                Get Started Now
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </a>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════
            CONTRACTS SECTION
           ══════════════════════════════════════════════════════════════ */}
        <section className="py-24 space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold text-white">On-Chain Contracts</h2>
            <p className="text-sm text-white/30">Verified contracts powering the airdrop</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-4 max-w-3xl mx-auto">
            <ContractCard
              chain="EVM"
              address={EVM_CONTRACT_ADDRESS}
              explorerUrl={`${EVM_EXPLORER[EVM_CHAIN]}/address/${EVM_CONTRACT_ADDRESS}`}
              color="blue"
            />
            <ContractCard
              chain="Solana"
              address={SOLANA_PROGRAM_ID}
              explorerUrl={`https://explorer.solana.com/address/${SOLANA_PROGRAM_ID}?cluster=devnet`}
              color="purple"
            />
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════
            FEEDBACK / REPORT ISSUES SECTION
           ══════════════════════════════════════════════════════════════ */}
        <section id="feedback" className="py-24 space-y-8 max-w-2xl mx-auto">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold text-white">Report an Issue</h2>
            <p className="text-sm text-white/30">
              Found a bug? Have feedback? We&apos;d love to hear from you.
            </p>
          </div>
          <FeedbackSection />
        </section>

      </div>
    </>
  );
}

// ── Sub-components (colocated, server-rendered) ─────────────────────────────

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="group glass rounded-2xl p-6 space-y-4 glass-hover transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 hover:border-accent-500/20">
      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent-500/20 via-violet-500/20 to-pink-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
        <div className="text-accent-300">{icon}</div>
      </div>
      <h3 className="font-bold text-lg text-white group-hover:text-accent-200 transition-colors duration-300">
        {title}
      </h3>
      <p className="text-sm text-white/40 leading-relaxed">{description}</p>
    </div>
  );
}

function StepCard({
  number,
  title,
  description,
  icon,
}: {
  number: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="relative text-center space-y-4 p-6">
      <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-accent-500/20 via-violet-500/20 to-pink-500/20 flex items-center justify-center relative">
        <div className="text-accent-300">{icon}</div>
        <span className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-gradient-to-br from-accent-500 to-pink-500 text-white text-xs font-bold flex items-center justify-center shadow-lg">
          {number}
        </span>
      </div>
      <h3 className="font-bold text-lg text-white">{title}</h3>
      <p className="text-sm text-white/40 leading-relaxed max-w-xs mx-auto">
        {description}
      </p>
    </div>
  );
}

function ContractCard({
  chain,
  address,
  explorerUrl,
  color,
}: {
  chain: string;
  address: string;
  explorerUrl: string;
  color: "blue" | "purple";
}) {
  const isPlaceholder =
    address.startsWith("0x000") ||
    address === "11111111111111111111111111111111";

  const dotColor = color === "blue" ? "bg-blue-400" : "bg-purple-400";
  const bgColor = color === "blue" ? "bg-blue-500/10" : "bg-purple-500/10";
  const textColor = color === "blue" ? "text-blue-400" : "text-purple-400";

  return (
    <div className="group glass rounded-xl p-5 space-y-3 glass-hover transition-all duration-300 hover:scale-[1.01]">
      <div className="flex items-center gap-2">
        <span className={`text-xs uppercase tracking-wider font-medium ${textColor}`}>
          {chain} Contract
        </span>
        <span className="flex-1" />
        <span
          className={`h-2 w-2 rounded-full ${
            isPlaceholder ? "bg-warning/50 animate-pulse" : "bg-success"
          }`}
        />
      </div>
      {isPlaceholder ? (
        <p className="text-sm text-white/30 italic flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-warning/50 animate-pulse" />
          Address TBD — deploy pending
        </p>
      ) : (
        <>
          <p className="font-mono text-xs text-white/60 break-all leading-relaxed">
            {address}
          </p>
          <a
            href={explorerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center gap-1 text-xs ${textColor} hover:opacity-80 transition-opacity`}
          >
            View on explorer
            <svg
              className="w-3 h-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
          </a>
        </>
      )}
    </div>
  );
}

// ── SVG Icon Components ────────────────────────────────────────────────────

function WalletIcon() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
    </svg>
  );
}

function ZapIcon() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
    </svg>
  );
}

function ChartIcon() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
    </svg>
  );
}

function GlobeIcon() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
    </svg>
  );
}
