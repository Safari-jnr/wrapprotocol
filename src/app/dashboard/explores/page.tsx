// /dashboard/explores — discover DAOs & DeFi

const DAOS = [
  { name: "Popcorn",    desc: "DeFi made better — community-owned protocols.",          color: "from-yellow-500/30 to-yellow-600/10", logo: "🍿" },
  { name: "ENS DAO",    desc: "Decentralized naming for wallets & websites.",            color: "from-blue-400/30 to-blue-600/10",     logo: "🔵" },
  { name: "Lil Nouns",  desc: "A DAO built around the Lil Nouns NFT community.",         color: "from-purple-400/30 to-pink-500/10",   logo: "🎨" },
  { name: "Uniswap",    desc: "The leading decentralized exchange protocol.",            color: "from-pink-400/30 to-red-500/10",      logo: "🦄" },
  { name: "Aave",       desc: "Open-source liquidity protocol for earning interest.",    color: "from-green-400/30 to-teal-600/10",    logo: "👻" },
  { name: "Curve",      desc: "Stablecoin exchange with low fees and low slippage.",     color: "from-cyan-400/30 to-blue-500/10",     logo: "〰️" },
  { name: "Compound",   desc: "Algorithmic money market protocol.",                      color: "from-green-500/30 to-emerald-600/10", logo: "💠" },
  { name: "MakerDAO",   desc: "Decentralized stablecoin protocol behind DAI.",           color: "from-blue-500/30 to-indigo-600/10",   logo: "🏛️" },
];

const DEFI_PROTOCOLS = [
  { name: "Nereus Finance",  network: "Avalanche", networkColor: "text-red-400",    tvl: "$14M",    logo: "🔺" },
  { name: "Curve",           network: "Arbitrum",  networkColor: "text-blue-400",   tvl: "$2.1B",   logo: "〰️" },
  { name: "Aave V3",         network: "Ethereum",  networkColor: "text-blue-300",   tvl: "$8.1B",   logo: "👻" },
  { name: "Uniswap V3",      network: "Base",      networkColor: "text-blue-400",   tvl: "$4.2B",   logo: "🦄" },
  { name: "Raydium",         network: "Solana",    networkColor: "text-purple-400", tvl: "$890M",   logo: "☀️" },
  { name: "Marinade",        network: "Solana",    networkColor: "text-purple-400", tvl: "$1.3B",   logo: "🫙" },
  { name: "PancakeSwap",     network: "BNB Chain", networkColor: "text-yellow-400", tvl: "$3.5B",   logo: "🥞" },
  { name: "Trader Joe",      network: "Avalanche", networkColor: "text-red-400",    tvl: "$520M",   logo: "🦋" },
];

export default function ExplorePage() {
  return (
    <div className="max-w-5xl space-y-12 animate-fade-up">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold text-white">Explore</h2>
        <p className="text-sm text-white/40">
          Discover DAOs and DeFi protocols across multiple chains.
        </p>
      </div>

      {/* Discover DAOs */}
      <section className="space-y-5">
        <h3 className="text-sm font-semibold text-white/50 uppercase tracking-wider">
          🏛️ Discover DAOs
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {DAOS.map((dao) => (
            <div key={dao.name} className="group glass rounded-2xl overflow-hidden glass-hover transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1">
              <div className={`h-16 bg-gradient-to-br ${dao.color} flex items-center justify-center`}>
                <span className="text-2xl opacity-80">{dao.logo}</span>
              </div>
              <div className="p-3 space-y-1">
                <h4 className="font-bold text-white text-xs group-hover:text-accent-200 transition-colors">{dao.name}</h4>
                <p className="text-[10px] text-white/40 leading-relaxed line-clamp-2">{dao.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Discover DeFi */}
      <section className="space-y-5">
        <h3 className="text-sm font-semibold text-white/50 uppercase tracking-wider">
          📈 Discover DeFi
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {DEFI_PROTOCOLS.map((protocol) => (
            <div key={protocol.name} className="group glass rounded-2xl p-3 space-y-2 glass-hover transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <span className="text-lg">{protocol.logo}</span>
                <span className={`text-[9px] font-medium ${protocol.networkColor}`}>{protocol.network}</span>
              </div>
              <h4 className="font-bold text-white text-xs group-hover:text-accent-200 transition-colors">{protocol.name}</h4>
              <div className="flex items-center justify-between pt-1 border-t border-white/5">
                <span className="text-[9px] text-white/30 uppercase tracking-wider">TVL</span>
                <span className="text-[10px] font-semibold text-accent-300">{protocol.tvl}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
