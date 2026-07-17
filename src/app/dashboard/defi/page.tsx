// /dashboard/defi — DeFi opportunities

const DEFI_OPPORTUNITIES = [
  {
    id: "uniswap",
    name: "Uniswap V3",
    logo: "🦄",
    category: "DEX",
    apy: "12.4%",
    tvl: "$4.2B",
    chain: "EVM",
    risk: "low" as const,
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
    risk: "medium" as const,
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
    risk: "low" as const,
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
    risk: "low" as const,
    description: "Liquid stake your SOL",
    ctaLabel: "Stake",
    ctaHref: "https://marinade.finance",
  },
];

const RISK_BADGE: Record<"low" | "medium" | "high", string> = {
  low: "text-success bg-success/10 border-success/20",
  medium: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
  high: "text-red-400 bg-red-400/10 border-red-400/20",
};

export default function DeFiPage() {
  const evmOpps = DEFI_OPPORTUNITIES.filter((d) => d.chain === "EVM");
  const solanaOpps = DEFI_OPPORTUNITIES.filter((d) => d.chain === "Solana");

  return (
    <div className="max-w-4xl space-y-10 animate-fade-up">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold text-white">DeFi Opportunities</h2>
        <p className="text-sm text-white/40">
          Put your MORK tokens to work. All APYs are indicative and change with
          market conditions.
        </p>
      </div>

      <DefiGroup title="⟠ EVM" items={evmOpps} />
      <DefiGroup title="◎ Solana" items={solanaOpps} />
    </div>
  );
}

function DefiGroup({
  title,
  items,
}: {
  title: string;
  items: typeof DEFI_OPPORTUNITIES;
}) {
  return (
    <section className="space-y-4">
      <h3 className="text-sm font-semibold text-white/50 uppercase tracking-wider">
        {title}
      </h3>
      <div className="grid sm:grid-cols-2 gap-4">
        {items.map((protocol) => (
          <div
            key={protocol.id}
            className="glass rounded-2xl p-5 space-y-4 glass-hover transition-all duration-300 hover:scale-[1.01]"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{protocol.logo}</span>
                <div>
                  <p className="font-semibold text-white text-sm">
                    {protocol.name}
                  </p>
                  <p className="text-xs text-white/40">{protocol.category}</p>
                </div>
              </div>
              <span
                className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full border ${
                  RISK_BADGE[protocol.risk]
                }`}
              >
                {protocol.risk} risk
              </span>
            </div>

            <p className="text-xs text-white/50">{protocol.description}</p>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-white/5 px-3 py-2">
                <p className="text-[10px] text-white/30 uppercase tracking-wider">
                  APY
                </p>
                <p className="text-sm font-bold text-success mt-0.5">
                  {protocol.apy}
                </p>
              </div>
              <div className="rounded-lg bg-white/5 px-3 py-2">
                <p className="text-[10px] text-white/30 uppercase tracking-wider">
                  TVL
                </p>
                <p className="text-sm font-bold text-white/70 mt-0.5">
                  {protocol.tvl}
                </p>
              </div>
            </div>

            <a
              href={protocol.ctaHref}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full text-center rounded-xl px-4 py-2.5 text-xs font-bold bg-white/5 text-white/60 border border-white/5 hover:bg-white/10 hover:text-white transition-all duration-200"
            >
              {protocol.ctaLabel} ↗
            </a>
          </div>
        ))}
      </div>
    </section>
  );
}
