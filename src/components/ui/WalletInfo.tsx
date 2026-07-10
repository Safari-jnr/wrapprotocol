"use client";

import { useAccount, useBalance } from "wagmi";
import { useWallet } from "@solana/wallet-adapter-react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useSupabase } from "@/components/providers/SupabaseProvider";
import { LinkWalletButton } from "./LinkWalletButton";

export function WalletInfo() {
  const { address: evmAddress, isConnected: evmConnected, chain } = useAccount();
  const { publicKey: solanaKey, connected: solanaConnected } = useWallet();
  const { session } = useSupabase();

  const { data: balance } = useBalance({
    address: evmAddress,
    query: { enabled: !!evmAddress },
  });

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5 space-y-4">
      {/* EVM wallet */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <p className="text-xs text-white/40 uppercase tracking-wider mb-1">EVM Wallet</p>
          {evmConnected && evmAddress ? (
            <div className="space-y-0.5">
              <p className="font-mono text-sm text-white/80 break-all">{evmAddress}</p>
              <p className="text-xs text-white/40">
                {chain?.name ?? "Unknown network"} ·{" "}
                {balance
                  ? `${parseFloat(balance.formatted).toFixed(4)} ${balance.symbol}`
                  : "—"}
              </p>
            </div>
          ) : (
            <p className="text-sm text-white/30">Not connected</p>
          )}
        </div>
        <ConnectButton
          chainStatus="icon"
          accountStatus="avatar"
          showBalance={false}
        />
      </div>

      {/* Solana wallet */}
      <div>
        <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Solana Wallet</p>
        {solanaConnected && solanaKey ? (
          <p className="font-mono text-sm text-white/80 break-all">
            {solanaKey.toBase58()}
          </p>
        ) : (
          <p className="text-sm text-white/30">Not connected</p>
        )}
      </div>

      {/* Email account */}
      {session && (
        <div className="border-t border-white/10 pt-4 flex items-center justify-between flex-wrap gap-3">
          <div>
            <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Email Account</p>
            <p className="text-sm text-white/70">{session.user.email}</p>
          </div>
          {evmConnected && evmAddress && (
            <LinkWalletButton walletAddress={evmAddress} chain="evm" />
          )}
        </div>
      )}
    </div>
  );
}
