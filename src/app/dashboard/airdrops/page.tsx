// /dashboard/airdrops — all airdrops list
import Link from "next/link";

const MOCK_AIRDROPS = [
  {
    id: "mork",
    name: "Mork Airdrop",
    symbol: "MORK",
    logo: "🪐",
    tokensPerClaim: 1000,
    priceModel: "30% of wallet balance",
    chains: ["EVM", "Solana"],
    status: "live" as const,
    claimedCount: 247,
    totalSupply: 10_000_000,
    endsAt: "2025-12-31",
    ctaLabel: "Claim Now",
    ctaHref: "/dashboard/claim",
    description:
      "The official Mork Protocol airdrop. Connect your wallet, pay 30% of your balance, and receive 1000 MORK tokens instantly.",
  },
  {
    id: "defi-protocol",
    name: "DeFi Protocol Alpha",
    symbol: "DPA",
    logo: "⚡",
    tokensPerClaim: 500,
    priceModel: "Free claim",
    chains: ["EVM"],
    status: "upcoming" as const,
    claimedCount: 0,
    totalSupply: 5_000_000,
    endsAt: "2025-09-01",
    ctaLabel: "Coming Soon",
    ctaHref: "#",
    description:
      "An upcoming free airdrop for early adopters of the DeFi Protocol Alpha platform. No payment required.",
  },
  {
    id: "nft-drop",
    name: "Genesis NFT Drop",
    symbol: "GEN",
    logo: "🎨",
    tokensPerClaim: 1,
    priceModel: "Whitelist only",
    chains: ["Solana"],
    status: "ended" as const,
    claimedCount: 1000,
    totalSupply: 1000,
    endsAt: "2025-06-01",
    ctaLabel: "Ended",
    ctaHref: "#",
    description:
      "The Genesis NFT collection on Solana. Fully claimed. Whitelist-only drop for early community members.",
  },
];

export default function AirdropsPage() {
  const liveAirdrops = MOCK_AIRDROPS.filter((a) => a.status === "live");
  const upcomingAirdrops = MOCK_AIRDROPS.filter((a) => a.status === "upcoming");
  const endedAirdrops = MOCK_AIRDROPS.filter((a) => a.status === "ended");

  return (
    <div className="max-w-4xl space-y-10 animate-fade-up">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold text-white">Airdrops</h2>
        <p className="text-sm text-white/40">
          Browse all available, upcoming, and past airdrop campaigns.
        </p>
      </div>

      {liveAirdrops.length > 0 && (
        <AirdropGroup title="🟢 Live" items={liveAirdrops} />
      )}
      {upcomingAirdrops.length > 0 && (
        <AirdropGroup title="⏳ Upcoming" items={upcomingAirdrops} />
      )}
      {endedAirdrops.length > 0 && (
        <AirdropGroup title="✓ Ended" items={endedAirdrops} />
      )}
    </div>
  );
}

function AirdropGroup({
  title,
  items,
}: {
  title: string;
  items: typeof MOCK_AIRDROPS;
}) {
  return (
    <section className="space-y-4">
      <h3 className="text-sm font-semibold text-white/50 uppercase tracking-wider">
        {title}
      </h3>
      <div className="space-y-3">
        {items.map((airdrop) => {
          const progress = Math.min(
            100,
            (airdrop.claimedCount / airdrop.totalSupply) * 100
          );
          const isLive = airdrop.status === "live";

          return (
            <div
              key={airdrop.id}
              className="glass rounded-2xl p-5 glass-hover transition-all duration-300 hover:scale-[1.005]"
            >
              <div className="flex items-start gap-4 flex-wrap">
                <span className="text-3xl mt-0.5">{airdrop.logo}</span>

                <div className="flex-1 min-w-0 space-y-3">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div>
                      <p className="font-semibold text-white">{airdrop.name}</p>
                      <p className="text-xs text-white/40 mt-0.5">
                        {airdrop.description}
                      </p>
                    </div>
                    <Link
                      href={airdrop.ctaHref}
                      className={`shrink-0 rounded-xl px-4 py-2 text-xs font-bold transition-all duration-200 ${
                        isLive
                          ? "bg-accent-500/20 text-accent-300 border border-accent-500/20 hover:bg-accent-500/30"
                          : "bg-white/5 text-white/25 border border-white/5 pointer-events-none"
                      }`}
                    >
                      {airdrop.ctaLabel}
                    </Link>
                  </div>

                  <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-white/40">
                    <span>
                      <span className="text-white/60">
                        {airdrop.tokensPerClaim.toLocaleString()}
                      </span>{" "}
                      {airdrop.symbol} / claim
                    </span>
                    <span>{airdrop.priceModel}</span>
                    <span>Ends {airdrop.endsAt}</span>
                    <span className="flex gap-1.5">
                      {airdrop.chains.map((c) => (
                        <span
                          key={c}
                          className="px-1.5 py-0.5 rounded bg-white/5 border border-white/5 text-[10px] text-white/30"
                        >
                          {c}
                        </span>
                      ))}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-white/25">
                      <span>
                        {airdrop.claimedCount.toLocaleString()} claimed
                      </span>
                      <span>
                        {airdrop.totalSupply.toLocaleString()} total
                      </span>
                    </div>
                    <div className="h-1 rounded-full bg-white/5 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-linear-to-r from-accent-500 to-violet-500 transition-all duration-700"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
