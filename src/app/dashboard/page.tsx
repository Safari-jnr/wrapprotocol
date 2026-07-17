// Dashboard Overview — wallet summary + recent activity
import { Suspense } from "react";
import { WalletInfo } from "@/components/ui/WalletInfo";
import { ClaimHistory } from "@/components/ui/ClaimHistory";
import { LiveClaimToast } from "@/components/ui/LiveClaimToast";
import { TOKEN_SYMBOL } from "@/lib/constants";
import Link from "next/link";

// ── Quick stats data ────────────────────────────────────────────────────
const FEATURED_ITEMS = [
  {
    id: "mork",
    name: "Mork Protocol",
    logo: "🪐",
    chains: ["EVM", "Solana"],
    status: "live" as const,
    ctaLabel: "Open",
    ctaHref: "/dashboard/claim",
    description: "The official Mork Protocol — manage your tokens and explore DeFi.",
  },
  {
    id: "defi-protocol",
    name: "DeFi Discovery",
    logo: "📈",
    chains: ["EVM"],
    status: "live" as const,
    ctaLabel: "Explore",
    ctaHref: "/dashboard/explores",
    description: "Discover top DeFi protocols and DAOs across multiple chains.",
  },
];

export default function DashboardOverviewPage() {
  return (
    <>
      <LiveClaimToast />

      <div className="space-y-8 animate-fade-up max-w-5xl">
        {/* Welcome row */}
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-white">Welcome back 👋</h2>
          <p className="text-sm text-white/40">
            Here&apos;s a summary of your wallets and activity.
          </p>
        </div>

        {/* Wallet summary cards */}
        <Suspense
          fallback={
            <div className="grid sm:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-28 animate-pulse rounded-2xl bg-white/5" />
              ))}
            </div>
          }
        >
          <WalletInfo />
        </Suspense>

        {/* Featured items */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white/50 uppercase tracking-wider">
              Quick Access
            </h3>
            <Link
              href="/dashboard/explores"
              className="text-xs text-accent-400 hover:text-accent-300 transition-colors"
            >
              View all →
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {FEATURED_ITEMS.map((item) => (
              <FeatureCard key={item.id} {...item} />
            ))}
          </div>
        </section>

        {/* Quick links */}
        <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <QuickLink href="/dashboard/claim" label={`Claim ${TOKEN_SYMBOL}`} emoji="🪙" color="accent" />
          <QuickLink href="/dashboard/explores" label="Explore" emoji="🔍" color="violet" />
          <QuickLink href="/dashboard/portfolio" label="Portfolio" emoji="💼" color="blue" />
          <QuickLink href="/dashboard/history" label="History" emoji="📋" color="green" />
        </section>

        {/* Recent claim history */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white/50 uppercase tracking-wider">
              Recent Claims
            </h3>
            <Link
              href="/dashboard/history"
              className="text-xs text-accent-400 hover:text-accent-300 transition-colors"
            >
              Full history →
            </Link>
          </div>
          <Suspense
            fallback={
              <div className="h-24 animate-pulse rounded-xl bg-white/5" />
            }
          >
            <ClaimHistory limit={5} />
          </Suspense>
        </section>
      </div>
    </>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function FeatureCard({
  logo,
  name,
  chains,
  status,
  ctaLabel,
  ctaHref,
  description,
}: {
  logo: string;
  name: string;
  chains: string[];
  status: "live";
  ctaLabel: string;
  ctaHref: string;
  description: string;
}) {
  const isLive = status === "live";

  return (
    <div className="glass rounded-2xl p-5 space-y-4 glass-hover transition-all duration-300 hover:scale-[1.01]">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{logo}</span>
          <div>
            <p className="font-semibold text-white text-sm">{name}</p>
          </div>
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full border text-success bg-success/10 border-success/20">
          {status}
        </span>
      </div>

      <p className="text-xs text-white/40 leading-relaxed">{description}</p>

      <div className="flex gap-1.5">
        {chains.map((c) => (
          <span key={c} className="px-1.5 py-0.5 rounded bg-white/5 border border-white/5 text-[10px] text-white/30">{c}</span>
        ))}
      </div>

      <Link
        href={ctaHref}
        className={`block w-full text-center rounded-xl px-4 py-2.5 text-xs font-bold transition-all duration-200 ${
          isLive
            ? "bg-accent-500/20 text-accent-300 border border-accent-500/20 hover:bg-accent-500/30"
            : "bg-white/5 text-white/30 border border-white/5 cursor-default pointer-events-none"
        }`}
      >
        {ctaLabel}
      </Link>
    </div>
  );
}

function QuickLink({
  href,
  label,
  emoji,
  color,
}: {
  href: string;
  label: string;
  emoji: string;
  color: "accent" | "violet" | "blue" | "green";
}) {
  const colors = {
    accent: "from-accent-500/10 to-accent-500/5 border-accent-500/10 hover:border-accent-500/20",
    violet: "from-violet-500/10 to-violet-500/5 border-violet-500/10 hover:border-violet-500/20",
    blue: "from-blue-500/10 to-blue-500/5 border-blue-500/10 hover:border-blue-500/20",
    green: "from-green-500/10 to-green-500/5 border-green-500/10 hover:border-green-500/20",
  };

  return (
    <Link
      href={href}
      className={`glass rounded-xl p-4 flex items-center gap-3 border bg-linear-to-br ${colors[color]} transition-all duration-200 hover:scale-[1.02] group`}
    >
      <span className="text-xl">{emoji}</span>
      <span className="text-sm font-medium text-white/70 group-hover:text-white transition-colors">
        {label}
      </span>
    </Link>
  );
}
