// /dashboard/portfolio — token holdings (mock data, wire up real balances later)
"use client";

import { useAccount, useBalance } from "wagmi";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { useEffect, useState } from "react";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { formatEth } from "@/lib/constants";

const MOCK_TOKENS = [
  { symbol: "MORK", name: "Mork",     logo: "🪐", balance: 1000,  value: "$120.00",  chain: "EVM"    },
  { symbol: "USDC", name: "USD Coin", logo: "$",  balance: 250,   value: "$250.00",  chain: "EVM"    },
];

export default function PortfolioPage() {
  const { address, isConnected } = useAccount();
  const { data: ethBalance } = useBalance({ address, query: { enabled: !!address } });
  const { publicKey, connected } = useWallet();
  const { connection } = useConnection();
  const [solBalance, setSolBalance] = useState<number | null>(null);

  useEffect(() => {
    if (!connected || !publicKey) return;
    connection
      .getBalance(publicKey)
      .then((lamports) => setSolBalance(lamports / LAMPORTS_PER_SOL))
      .catch(() => setSolBalance(null));
  }, [connected, publicKey, connection]);

  return (
    <div className="max-w-3xl space-y-8 animate-fade-up">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold text-white">Portfolio</h2>
        <p className="text-sm text-white/40">
          Your token holdings across EVM and Solana.
        </p>
      </div>

      {/* Native balances — live from wallet hooks */}
      <section className="space-y-4">
        <h3 className="text-sm font-semibold text-white/50 uppercase tracking-wider">
          Native Balances
        </h3>
        <div className="grid sm:grid-cols-2 gap-4">
          {/* ETH */}
          <div className="glass rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-2xl">⟠</span>
              <div>
                <p className="font-semibold text-white text-sm">Ethereum</p>
                <p className="text-xs text-white/40">ETH &middot; EVM</p>
              </div>
            </div>
            {isConnected && ethBalance ? (
              <p className="text-xl font-bold text-white">
                {formatEth(ethBalance.value)}{" "}
                <span className="text-sm font-normal text-white/40">ETH</span>
              </p>
            ) : (
              <p className="text-sm text-white/25">
                {isConnected ? "Loading…" : "Wallet not connected"}
              </p>
            )}
          </div>

          {/* SOL */}
          <div className="glass rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-2xl">◎</span>
              <div>
                <p className="font-semibold text-white text-sm">Solana</p>
                <p className="text-xs text-white/40">SOL &middot; Solana</p>
              </div>
            </div>
            {connected && solBalance !== null ? (
              <p className="text-xl font-bold text-white">
                {solBalance.toFixed(4)}{" "}
                <span className="text-sm font-normal text-white/40">SOL</span>
              </p>
            ) : (
              <p className="text-sm text-white/25">
                {connected ? "Loading…" : "Wallet not connected"}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Token holdings — mock until token balance reads are wired */}
      <section className="space-y-4">
        <h3 className="text-sm font-semibold text-white/50 uppercase tracking-wider">
          Token Holdings
        </h3>
        <div className="glass rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left px-5 py-3 text-xs text-white/30 font-medium uppercase tracking-wider">
                  Token
                </th>
                <th className="text-right px-5 py-3 text-xs text-white/30 font-medium uppercase tracking-wider">
                  Balance
                </th>
                <th className="text-right px-5 py-3 text-xs text-white/30 font-medium uppercase tracking-wider hidden sm:table-cell">
                  Value
                </th>
                <th className="text-right px-5 py-3 text-xs text-white/30 font-medium uppercase tracking-wider hidden md:table-cell">
                  Chain
                </th>
              </tr>
            </thead>
            <tbody>
              {MOCK_TOKENS.map((token, i) => (
                <tr
                  key={token.symbol}
                  className={`transition-colors hover:bg-white/2 ${
                    i < MOCK_TOKENS.length - 1 ? "border-b border-white/5" : ""
                  }`}
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{token.logo}</span>
                      <div>
                        <p className="font-medium text-white">{token.symbol}</p>
                        <p className="text-xs text-white/30">{token.name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-right font-mono text-white/70">
                    {token.balance.toLocaleString()}
                  </td>
                  <td className="px-5 py-4 text-right text-white/50 hidden sm:table-cell">
                    {token.value}
                  </td>
                  <td className="px-5 py-4 text-right hidden md:table-cell">
                    <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/5 text-[10px] text-white/30">
                      {token.chain}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="px-5 py-3 text-[11px] text-white/20 border-t border-white/5">
            Token balances are mock data. Live balance reads will be wired after contract deploy.
          </p>
        </div>
      </section>
    </div>
  );
}
