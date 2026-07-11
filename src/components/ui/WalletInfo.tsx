"use client";

import { useAccount, useBalance } from "wagmi";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useSupabase } from "@/components/providers/SupabaseProvider";
import { LinkWalletButton } from "./LinkWalletButton";

function WalletIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
    </svg>
  );
}

export function WalletInfo() {
  const { address: evmAddress, isConnected: evmConnected, chain } = useAccount();
  const { publicKey: solanaKey, connected: solanaConnected } = useWallet();
  const { session } = useSupabase();

  const { data: balance } = useBalance({
    address: evmAddress,
    query: { enabled: !!evmAddress },
  });

  // Safely access balance fields with a fallback
  const balanceDisplay = balance
    ? `${(Number(balance.value) / 10 ** balance.decimals).toFixed(4)} ${balance.symbol}`
    : "—";

  return (
    <div className="glass rounded-2xl p-5 space-y-4">
      {/* EVM wallet */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div className="space-y-0.5 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <WalletIcon />
            <p className="text-xs text-white/40 uppercase tracking-wider font-medium">
              EVM Wallet
            </p>
          </div>
          {evmConnected && evmAddress ? (
            <div className="space-y-0.5">
              <p className="font-mono text-sm text-white/70 break-all">
                {evmAddress.slice(0, 6)}...{evmAddress.slice(-4)}
              </p>
              <p className="text-xs text-white/40">
                {chain?.name ?? "Unknown network"} &middot;{" "}
                {balanceDisplay}
              </p>
            </div>
          ) : (
            <p className="text-sm text-white/30 italic">Not connected</p>
          )}
        </div>
        <ConnectButton
          chainStatus="icon"
          accountStatus="avatar"
          showBalance={false}
        />
      </div>

      {/* Solana wallet */}
      <div className="border-t border-white/5 pt-4 space-y-0.5">
        <div className="flex items-center gap-2 mb-1">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
          </svg>
          <p className="text-xs text-white/40 uppercase tracking-wider font-medium">
            Solana Wallet
          </p>
        </div>
        <div className="flex items-center justify-between flex-wrap gap-3">
          {solanaConnected && solanaKey ? (
            <p className="font-mono text-sm text-white/70 break-all">
              {solanaKey.toBase58().slice(0, 6)}...{solanaKey.toBase58().slice(-4)}
            </p>
          ) : (
            <p className="text-sm text-white/30 italic">Not connected</p>
          )}
          <WalletMultiButton />
        </div>
      </div>

      {/* Email account */}
      {session && (
        <div className="border-t border-white/5 pt-4 space-y-3">
          <div className="flex items-center gap-2 mb-1">
            <MailIcon />
            <p className="text-xs text-white/40 uppercase tracking-wider font-medium">
              Email Account
            </p>
          </div>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <p className="text-sm text-white/60">{session.user.email}</p>
            {evmConnected && evmAddress && (
              <LinkWalletButton walletAddress={evmAddress} chain="evm" />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
