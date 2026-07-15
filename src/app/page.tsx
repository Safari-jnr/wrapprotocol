// Landing page — Server Component with client islands for interactivity
// ExploreDapps.fun — Your Portal to Web3
import { Suspense } from "react";
import { StatsBar } from "@/components/ui/StatsBar";
import { HeroActions } from "@/components/ui/HeroActions";
import { LiveClaimFeed } from "@/components/ui/LiveClaimFeed";
import { ClaimNowButton } from "@/components/ui/ClaimNowButton";
import {
  TOKEN_SYMBOL,
  TOKENS_PER_CLAIM,
} from "@/lib/constants";

export default function HomePage() {
  return (
    <>

      {/* ══ HERO ════════════════════════════════════════════════════════════ */}
      <section className="relative pt-28 pb-20 md:pt-48 md:pb-32 px-5 sm:px-6 overflow-hidden">
        {/* Background orbs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none">
          <div className="absolute top-20 left-1/4 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[100px]" />
          <div className="absolute bottom-20 right-1/4 w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[100px]" />
        </div>

        <div className="relative max-w-5xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-purple-500/20 mb-10 animate-fade-up">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400" />
            </span>
            <span className="text-sm text-gray-300 font-medium">
              Your Portal to Web3
            </span>
          </div>

          <h1 className="text-[1.65rem] sm:text-5xl md:text-7xl lg:text-8xl font-extrabold mb-8 sm:mb-8 leading-[1.15] tracking-tight animate-fade-up [animation-delay:100ms] [animation-fill-mode:backwards]">
            Discover
            <br />
            <span className="gradient-text">The Real Web3</span>
          </h1>

          <p className="text-sm sm:text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10 sm:mb-12 leading-relaxed animate-fade-up [animation-delay:200ms] [animation-fill-mode:backwards]">
            ExploreDapps.fun is your gateway to everything Web3. Track your
            wallets, discover DApps, find airdrops, and explore NFTs, DAOs,
            DeFi, GameFi across EVM and Solana.
          </p>

          {/* Stats — server-rendered */}
          <div className="animate-fade-up [animation-delay:350ms] [animation-fill-mode:backwards] mb-14">
            <Suspense
              fallback={
                <div className="h-16 animate-pulse rounded-xl bg-white/5" />
              }
            >
              <StatsBar />
            </Suspense>
          </div>

          {/* ── ACTION BUTTONS (client island) ── */}
          <div className="animate-fade-up [animation-delay:450ms] [animation-fill-mode:backwards]">
            <HeroActions />
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="hidden sm:flex absolute bottom-8 left-1/2 -translate-x-1/2">
          <div className="flex flex-col items-center gap-2 text-white/20">
            <span className="text-xs tracking-widest uppercase">Scroll</span>
            <svg
              className="w-4 h-4 animate-bounce"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>
      </section>

      {/* ══ MORK TOKEN AIRDROP BANNER ═══════════════════════════════════════ */}
      <section className="px-6 py-6" id="airdrop">
        <div className="max-w-4xl mx-auto">
          <div className="relative overflow-hidden rounded-2xl bg-linear-to-r from-purple-900/40 via-blue-900/40 to-cyan-900/40 border border-purple-500/30 p-6 md:p-10">
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/20 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/20 rounded-full blur-[60px] translate-y-1/2 -translate-x-1/2" />

            <div className="relative flex flex-col md:flex-row items-center gap-4 md:gap-10 text-center md:text-left">
              <div className="w-16 h-16 md:w-24 md:h-24 rounded-2xl bg-linear-to-br from-purple-500 to-blue-600 flex items-center justify-center shadow-2xl shadow-purple-500/30 flex-shrink-0">
                <span className="text-2xl md:text-4xl font-bold text-white">
                  M
                </span>
              </div>
              <div className="text-center md:text-left flex-1">
                <div className="flex items-center gap-1.5 md:gap-2 justify-center md:justify-start mb-2 flex-wrap">
                  <span className="px-2 py-0.5 rounded bg-green-500/20 text-green-400 text-xs font-bold uppercase tracking-wider">
                    Live Airdrop
                  </span>
                  <span className="text-xs text-gray-400">Ends in 14 days</span>
                </div>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-2">
                  Connect Wallet &amp; Receive MORK Token
                </h2>
                <p className="text-gray-400 text-xs sm:text-sm md:text-base">
                  Link your wallet to ExploreDapps and instantly receive{" "}
                  <span className="text-purple-400 font-semibold">
                    {TOKENS_PER_CLAIM.toLocaleString()} MORK
                  </span>{" "}
                  tokens. Early adopters get bonus rewards.
                </p>
              </div>
              <ClaimNowButton />
            </div>
          </div>
        </div>
      </section>

      {/* ══ LIVE CLAIMS FEED — IMMEDIATELY AFTER AIRDROP BANNER ═══════════ */}
      <section className="px-6 py-12 bg-white/[0.02] border-y border-white/10">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden p-6">
            <Suspense
              fallback={
                <div className="h-24 animate-pulse rounded-xl bg-white/5" />
              }
            >
              <LiveClaimFeed />
            </Suspense>
          </div>
        </div>
      </section>

      {/* ══ EXPLORE WEB3 CATEGORIES ═════════════════════════════════════════ */}
      <section className="py-16 md:py-24 px-4 sm:px-6" id="categories">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10 md:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 md:mb-4">
              Explore Web3 Categories
            </h2>
            <p className="text-sm sm:text-lg text-gray-400 max-w-2xl mx-auto">
              Discover the best decentralized applications across all major
              categories
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            <CategoryCard
              icon={
                <svg
                  className="w-7 h-7 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              }
              title="DeFi"
              body="Decentralized finance protocols for lending, borrowing, and yield farming."
              color="from-green-400 to-emerald-600"
              hoverColor="hover:border-green-500/30"
              linkColor="text-green-400"
            />
            <CategoryCard
              icon={
                <svg
                  className="w-7 h-7 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              }
              title="NFTs"
              body="Marketplaces, collections, and tools for creating and trading NFTs."
              color="from-pink-400 to-rose-600"
              hoverColor="hover:border-pink-500/30"
              linkColor="text-pink-400"
            />
            <CategoryCard
              icon={
                <svg
                  className="w-7 h-7 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              }
              title="DAOs"
              body="Decentralized autonomous organizations and governance tools."
              color="from-blue-400 to-indigo-600"
              hoverColor="hover:border-blue-500/30"
              linkColor="text-blue-400"
            />
            <CategoryCard
              icon={
                <svg
                  className="w-7 h-7 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              }
              title="GameFi"
              body="Blockchain gaming, play-to-earn, and metaverse experiences."
              color="from-yellow-400 to-orange-600"
              hoverColor="hover:border-yellow-500/30"
              linkColor="text-yellow-400"
            />
            <CategoryCard
              icon={
                <svg
                  className="w-7 h-7 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                  />
                </svg>
              }
              title="Wallets"
              body="Secure wallets for managing crypto assets across chains."
              color="from-cyan-400 to-teal-600"
              hoverColor="hover:border-cyan-500/30"
              linkColor="text-cyan-400"
            />
            <CategoryCard
              icon={
                <svg
                  className="w-7 h-7 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
              }
              title="Infrastructure"
              body="Oracles, bridges, indexing, and core blockchain infrastructure."
              color="from-violet-400 to-purple-600"
              hoverColor="hover:border-violet-500/30"
              linkColor="text-violet-400"
            />
          </div>
        </div>
      </section>

      {/* ══ TRENDING DAPPS ══════════════════════════════════════════════════ */}
      <section className="py-16 md:py-24 px-4 sm:px-6 bg-white/[0.02] border-y border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 md:mb-12">
            <div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2">
                Trending DApps
              </h2>
              <p className="text-sm sm:text-base text-gray-400">
                Most popular decentralized applications this week
              </p>
            </div>
            <button className="shrink-0 px-4 sm:px-5 py-2 sm:py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs sm:text-sm font-medium text-white/60 hover:bg-white/10 hover:text-white transition-colors">
              View All
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <DAppCard
              logo="U"
              name="Uniswap"
              subtitle="DEX • Ethereum"
              statLabel="Volume 24h"
              statValue="$1.2B ↗"
              barWidth="w-3/4"
              barColor="from-pink-500 to-rose-500"
            />
            <DAppCard
              logo="OS"
              name="OpenSea"
              subtitle="NFT Marketplace"
              statLabel="Volume 24h"
              statValue="$15M ↗"
              barWidth="w-1/2"
              barColor="from-blue-400 to-indigo-500"
            />
            <DAppCard
              logo="AA"
              name="Aave"
              subtitle="Lending Protocol"
              statLabel="TVL"
              statValue="$8.5B ↗"
              barWidth="w-5/6"
              barColor="from-purple-500 to-indigo-500"
            />
            <DAppCard
              logo="LD"
              name="Lido"
              subtitle="Liquid Staking"
              statLabel="TVL"
              statValue="$19B ↗"
              barWidth="w-full"
              barColor="from-cyan-400 to-blue-500"
            />
          </div>
        </div>
      </section>

    </>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function CategoryCard({
  icon,
  title,
  body,
  color,
  hoverColor,
  linkColor,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  color: string;
  hoverColor: string;
  linkColor: string;
}) {
  return (
    <div
      className={`group p-5 md:p-8 rounded-2xl bg-white/5 backdrop-blur-[10px] border border-white/10 card-hover cursor-pointer ${hoverColor} transition-all duration-300`}
    >
      <div
        className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-linear-to-br ${color} flex items-center justify-center mb-4 md:mb-6 shadow-lg group-hover:scale-110 transition-transform`}
      >
        {icon}
      </div>
      <h3 className="text-lg md:text-xl font-bold text-white mb-2 md:mb-3">{title}</h3>
      <p className="text-gray-400 text-xs sm:text-sm leading-relaxed mb-3 md:mb-4">{body}</p>
      <div
        className={`flex items-center ${linkColor} text-sm font-semibold`}
      >
        Explore{" "}
        <svg
          className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </div>
    </div>
  );
}

function DAppCard({
  logo,
  name,
  subtitle,
  statLabel,
  statValue,
  barWidth,
  barColor,
}: {
  logo: string;
  name: string;
  subtitle: string;
  statLabel: string;
  statValue: string;
  barWidth: string;
  barColor: string;
}) {
  return (
    <div className="p-4 md:p-5 rounded-2xl bg-white/5 backdrop-blur-[10px] border border-white/10 hover:border-white/20 transition-all cursor-pointer group">
      <div className="flex items-center gap-3 mb-3 md:mb-4">
        <div
          className={`w-10 h-10 md:w-12 md:h-12 rounded-xl bg-linear-to-br ${barColor} flex items-center justify-center text-white font-bold shadow-lg`}
        >
          {logo}
        </div>
        <div>
          <div className="font-semibold text-white">{name}</div>
          <div className="text-xs text-gray-500">{subtitle}</div>
        </div>
      </div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-400">{statLabel}</span>
        <span className="text-green-400 font-semibold">{statValue}</span>
      </div>
      <div className="mt-3 h-1.5 bg-white/10 rounded-full overflow-hidden">
        <div
          className={`h-full ${barWidth} bg-linear-to-r ${barColor} rounded-full`}
        />
      </div>
    </div>
  );
}
