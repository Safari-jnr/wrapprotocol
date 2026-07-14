"use client";

import { useAccount, useBalance } from "wagmi";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import dynamic from "next/dynamic";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useSupabase } from "@/components/providers/SupabaseProvider";
import { LinkWalletButton } from "./LinkWalletButton";
import { formatEth } from "@/lib/constants";
import { useEffect, useState } from "react";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";

const WalletMultiButton = dynamic(
  () =>
    import("@solana/wallet-adapter-react-ui").then((m) => m.WalletMultiButton),
  { ssr: false }
);

export function WalletInfo() {
  const { address: evmAddress, isConnected: evmConnected, chain } = useAccount();
  const { publicKey: solanaKey, connected: solanaConnected } = useWallet();
  const { connection } = useConnection();
  const { session } = useSupabase();
  const [solBalance, setSolBalance] = useState<number | null>(null);

  const { data: ethBalance } = useBalance({
    address: evmAddress,
    query: { enabled: !!evmAddress },
  });

  useEffect(() => {
    if (!solanaConnected || !solanaKey) return;
    connection
      .getBalance(solanaKey)
      .then((lamports) => setSolBalance(lamports / LAMPORTS_PER_SOL))
      .catch(() => setSolBalance(null));
  }, [solanaConnected, solanaKey, connection]);

  return (
    <div className="space-y-4">
      {/* Summary cards row */}
      <div className="grid sm:grid-cols-3 gap-4">
        {/* EVM card */}
        <SummaryCard
          icon="⟠"
          label="EVM Wallet"
          address={evmConnected && evmAddress ? `${evmAddress.slice(0, 6)}…${evmAddress.slice(-4)}` : null}
          balance={ethBalance ? `${formatEth(ethBalance.value)} ETH` : null}
          subtitle={chain?.name}
          connected={evmConnected}
          connectButton={
            <ConnectButton
              chainStatus="none"
              accountStatus="address"
              showBalance={false}
              label="Connect"
            />
          }
        />

        {/* SOL card */}
        <SummaryCard
          icon="◎"
          label="Solana Wallet"
          address={
            solanaConnected && solanaKey
              ? `${solanaKey.toBase58().slice(0, 6)}…${solanaKey.toBase58().slice(-4)}`
              : null
          }
          balance={solBalance !== null ? `${solBalance.toFixed(4)} SOL` : null}
          subtitle="Solana"
          connected={solanaConnected}
          connectButton={<WalletMultiButton />}
        />

        {/* Email/account card */}
        <div className="glass rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
            </svg>
            <p className="text-xs text-white/40 uppercase tracking-wider font-medium">
              Account
            </p>
          </div>
          {session ? (
            <div className="space-y-3">
              <p className="text-sm text-white/70 truncate">{session.user.email}</p>
              {evmConnected && evmAddress && (
                <LinkWalletButton walletAddress={evmAddress} chain="evm" />
              )}
            </div>
          ) : (
            <p className="text-sm text-white/25">Not signed in</p>
          )}
        </div>
      </div>
    </div>
  );
}

function SummaryCard({
  icon,
  label,
  address,
  balance,
  subtitle,
  connected,
  connectButton,
}: {
  icon: string;
  label: string;
  address: string | null;
  balance: string | null;
  subtitle?: string;
  connected: boolean;
  connectButton: React.ReactNode;
}) {
  return (
    <div className="glass rounded-2xl p-5 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">{icon}</span>
          <p className="text-xs text-white/40 uppercase tracking-wider font-medium">
            {label}
          </p>
        </div>
        <span
          className={`w-2 h-2 rounded-full ${
            connected ? "bg-success" : "bg-white/10"
          }`}
        />
      </div>

      {connected && address ? (
        <div className="space-y-0.5">
          <p className="font-mono text-sm text-white/70">{address}</p>
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs text-white/40">{subtitle}</p>
            {balance && (
              <p className="text-xs font-semibold text-accent-300">{balance}</p>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-sm text-white/25">Not connected</p>
          <div className="*:text-xs! *:py-1.5! *:px-3! *:rounded-lg!">
            {connectButton}
          </div>
        </div>
      )}
    </div>
  );
}
