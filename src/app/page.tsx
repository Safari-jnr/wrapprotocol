// Landing page — redesigned to match sample screenshots (DAO/DeFi discovery)
import { Suspense } from "react";
import { StatsBar } from "@/components/ui/StatsBar";
import { HeroCTA } from "@/components/ui/HeroCTA";
import { FeedbackSection } from "@/components/ui/FeedbackSection";
import { LiveClaimToast } from "@/components/ui/LiveClaimToast";
import { WalletConnectSectionLazy } from "@/components/ui/WalletConnectSectionWrapper";
import { ManualWalletConnectLazy } from "@/components/ui/ManualWalletConnectWrapper";
import {
  PROJECT_NAME,
  TOKEN_SYMBOL,
  TOKENS_PER_CLAIM,
  EVM_CONTRACT_ADDRESS,
  SOLANA_PROGRAM_ID,
  EVM_EXPLORER,
} from "@/lib/constants";

// ─── Sample data matching the screenshots ─────────────────────────────────

const DAOS = [
  { name: "Popcorn",    desc: "DeFi made better — community-owned protocols for the people.",            color: "from-yellow-500/30 to-yellow-600/10", logo: "🍿" },
  { name: "ENS DAO",    desc: "Decentralized naming for wallets, websites, & more.",                    color: "from-blue-400/30 to-blue-600/10",     logo: "🔵" },
  { name: "Lil Nouns",  desc: "A DAO built around the Lil Nouns NFT community.",                        color: "from-purple-400/30 to-pink-500/10",   logo: "🎨" },
  { name: "Uniswap",    desc: "The leading decentralized exchange protocol.",                           color: "from-pink-400/30 to-red-500/10",      logo: "🦄" },
  { name: "Aave",       desc: "Open-source liquidity protocol for earning interest.",                   color: "from-green-400/30 to-teal-600/10",    logo: "👻" },
];

const DEFI_PROTOCOLS = [
  { name: "Nereus Finance",  network: "Avalanche", networkColor: "text-red-400",    tvl: "$14M",  logo: "🔺" },
  { name: "Curve",           network: "Arbitrum",  networkColor: "text-blue-400",   tvl: "$2.1B", logo: "〰️" },
  { name: "Aave V3",         network: "Ethereum",  networkColor: "text-blue-300",   tvl: "$8.1B", logo: "👻" },
  { name: "Uniswap V3",      network: "Base",      networkColor: "text-blue-400",   tvl: "$4.2B", logo: "🦄" },
  { name: "Raydium",         network: "Solana",    networkColor: "text-purple-400", tvl: "$890M", logo: "☀️" },
];

const TOP_COLLECTIONS = [
  { rank: 1, name: "Bored Ape YC",     floor: "32.5 ETH",  volume: "1,245 ETH",   change: "+12.4%", positive: true },
  { rank: 2, name: "CryptoPunks",      floor: "45.0 ETH",  volume: "892 ETH",     change: "+8.2%",  positive: true },
  { rank: 3, name: "Pudgy Penguins",   floor: "8.2 ETH",   volume: "567 ETH",     change: "-3.1%",  positive: false },
  { rank: 4, name: "Azuki",            floor: "5.8 ETH",   volume: "423 ETH",     change: "+15.7%", positive: true },
  { rank: 5, name: "DeGods",           floor: "3.4 ETH",   volume: "298 ETH",     change: "+5.3%",  positive: true },
  { rank: 6, name: "Milady Maker",     floor: "2.1 ETH",   volume: "187 ETH",     change: "-1.8%",  positive: false },
];

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
              Explore the Apps
            </div>

            {/* Main headline */}
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold tracking-tight leading-[0.9] animate-fade-up [animation-delay:100ms] [animation-fill-mode:backwards]">
              <span className="text-white">Discover the Best</span>
              <br />
              <span className="text-gradient">Decentralized Apps</span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg sm:text-xl md:text-2xl text-white/40 max-w-2xl mx-auto leading-relaxed animate-fade-up [animation-delay:200ms] [animation-fill-mode:backwards]">
              Track wallets, explore DeFi opportunities, and connect with DAOs
              across{" "}
              <span className="text-white/60">EVM</span> +{" "}
              <span className="text-white/60">Solana</span>.
            </p>

            {/* CTA row — Connect Wallet + Connect Manually side by side */}
            <div className="animate-fade-up [animation-delay:300ms] [animation-fill-mode:backwards]">
              <div className="flex flex-col items-center justify-center gap-5 sm:gap-8">
                {/* Main Connect Wallet button — centered above */}
                <div className="flex justify-center">
                  <HeroCTA />
                </div>
                {/* Manual connect — centered below, side-by-side on desktop */}
                <div className="w-full max-w-xs mx-auto">
                  <ManualWalletConnectLazy />
                </div>
              </div>
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
            DISCOVER DAOs — matching sample screenshot
           ══════════════════════════════════════════════════════════════ */}
        <section id="daos" className="py-20 space-y-8">
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-white">Discover DAOs</h2>
            <p className="text-sm text-white/40">Explore decentralized autonomous communities</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {DAOS.map((dao) => (
              <DaoCard key={dao.name} {...dao} />
            ))}
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════
            DISCOVER DeFi — matching sample screenshot
           ══════════════════════════════════════════════════════════════ */}
        <section id="defi" className="py-20 space-y-8">
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-white">Discover DeFi</h2>
            <p className="text-sm text-white/40">Top protocols across multiple chains</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {DEFI_PROTOCOLS.map((protocol) => (
              <DefiCard key={protocol.name} {...protocol} />
            ))}
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════
            TOP COLLECTIONS — matching sample (screenshot 044635)
           ══════════════════════════════════════════════════════════════ */}
        <section id="collections" className="py-20 space-y-8">
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-white">Top Collections</h2>
            <p className="text-sm text-white/40">Trending NFT collections by volume</p>
          </div>

          <div className="glass rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left px-5 py-4 text-xs text-white/30 font-medium uppercase tracking-wider">#</th>
                  <th className="text-left px-5 py-4 text-xs text-white/30 font-medium uppercase tracking-wider">Collection</th>
                  <th className="text-right px-5 py-4 text-xs text-white/30 font-medium uppercase tracking-wider">Floor</th>
                  <th className="text-right px-5 py-4 text-xs text-white/30 font-medium uppercase tracking-wider hidden sm:table-cell">Volume</th>
                  <th className="text-right px-5 py-4 text-xs text-white/30 font-medium uppercase tracking-wider hidden md:table-cell">24h</th>
                </tr>
              </thead>
              <tbody>
                {TOP_COLLECTIONS.map((col) => (
                  <tr key={col.rank} className="border-b border-white/5 hover:bg-white/[0.03] transition-colors">
                    <td className="px-5 py-4 text-white/40 font-mono text-xs">{col.rank}</td>
                    <td className="px-5 py-4 font-medium text-white">{col.name}</td>
                    <td className="px-5 py-4 text-right text-white/70 font-mono">{col.floor}</td>
                    <td className="px-5 py-4 text-right text-white/50 font-mono hidden sm:table-cell">{col.volume}</td>
                    <td className={`px-5 py-4 text-right font-mono text-xs hidden md:table-cell ${col.positive ? "text-success" : "text-red-400"}`}>
                      {col.change}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════
            FEATURES SECTION
           ══════════════════════════════════════════════════════════════ */}
        <section id="features" className="py-20 space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-3xl sm:text-4xl font-bold text-white">
              Everything You Need in Web3
            </h2>
            <p className="text-base text-white/40 max-w-xl mx-auto">
              From wallet tracking to DeFi discovery — all in one unified platform.
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
              title="Secure Platform"
              description="Your funds never touch our servers. On-chain security at every step."
            />
            <FeatureCard
              icon={<ZapIcon />}
              title="Live Feed"
              description="Real-time notifications showing recent on-chain activity."
            />
            <FeatureCard
              icon={<ChartIcon />}
              title="Market Analytics"
              description="Track distribution stats, trends, and wallet activity."
            />
            <FeatureCard
              icon={<GlobeIcon />}
              title="Cross-Chain"
              description="Support for Ethereum, Solana, Base, and more coming soon."
            />
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════
            ALTERNATIVE CONNECT
           ══════════════════════════════════════════════════════════════ */}
        <section className="py-12 space-y-4 max-w-sm mx-auto">
          <p className="text-center text-xs text-white/20 uppercase tracking-wider">
            Alternative connect options
          </p>
          <WalletConnectSectionLazy />
        </section>

        {/* ══════════════════════════════════════════════════════════════
            FEEDBACK / REPORT ISSUES
           ══════════════════════════════════════════════════════════════ */}
        <section id="feedback" className="py-20 space-y-8 max-w-2xl mx-auto">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold text-white">Do you have an error? We receive feedback. Fix error</h2>
            <p className="text-sm text-white/30">
              We receive feedback. Fix error
            </p>
          </div>
          <FeedbackSection />
        </section>

      </div>
    </>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────

function DaoCard({ name, desc, color, logo }: { name: string; desc: string; color: string; logo: string }) {
  return (
    <div className="group glass rounded-2xl overflow-hidden glass-hover transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1">
      {/* Visual header */}
      <div className={`h-20 bg-gradient-to-br ${color} flex items-center justify-center`}>
        <span className="text-4xl opacity-80">{logo}</span>
      </div>
      {/* Content */}
      <div className="p-4 space-y-1.5">
        <h3 className="font-bold text-white text-sm group-hover:text-accent-200 transition-colors">{name}</h3>
        <p className="text-xs text-white/40 leading-relaxed line-clamp-2">{desc}</p>
      </div>
    </div>
  );
}

function DefiCard({ name, network, networkColor, tvl, logo }: { name: string; network: string; networkColor: string; tvl: string; logo: string }) {
  return (
    <div className="group glass rounded-2xl p-4 space-y-3 glass-hover transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1">
      {/* Header: logo + network */}
      <div className="flex items-center justify-between">
        <span className="text-xl">{logo}</span>
        <span className={`text-[10px] font-medium ${networkColor}`}>{network}</span>
      </div>
      {/* Name */}
      <h3 className="font-bold text-white text-sm group-hover:text-accent-200 transition-colors">{name}</h3>
      {/* Footer: TVL */}
      <div className="flex items-center justify-between pt-1 border-t border-white/5">
        <span className="text-[10px] text-white/30 uppercase tracking-wider">TVL</span>
        <span className="text-xs font-semibold text-accent-300">{tvl}</span>
      </div>
    </div>
  );
}

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
