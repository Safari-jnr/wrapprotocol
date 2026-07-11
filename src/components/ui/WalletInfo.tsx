"use client";

import { useAccount, useBalance } from "wagmi";
import { useWallet } from "@solana/wallet-adapter-react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useSupabase } from "@/components/providers/SupabaseProvider";
import { LinkWalletButton } from "./LinkWalletButton";

export function WalletInfo() {
  const { address: evmAddress, isConnected: evmConnected, chain } = useAccount();
  const { publicKey: solanaKey, connected: solanaConnected } = useWallet();
  const { session } = useSupabase();

  const { data: evmBalance } = useBalance({
    address: evmAddress,
    query: { enabled: !!evmAddress },
  });

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 divide-y divide-white/10">

      {/* ── EVM wallet row ─────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-3 p-5 flex-wrap">
        <div className="min-w-0">
          <p className="text-xs text-white/40 uppercase tracking-wider mb-1.5">
            ⟠ EVM Wallet
          </p>
          {evmConnected && evmAddress ? (
            <div className="space-y-0.5">
              <p className="font-mono text-sm text-white/80 break-all">
                {evmAddress}
              </p>
              <p className="text-xs text-white/40">
                {chain?.name ?? "Unknown network"} ·{" "}
                {evmBalance
                  ? `${parseFloat(evmBalance.formatted).toFixed(4)} ${evmBalance.symbol}`
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

      {/* ── Solana wallet row ───────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-3 p-5 flex-wrap">
        <div className="min-w-0">
          <p className="text-xs text-white/40 uppercase tracking-wider mb-1.5">
            ◎ Solana Wallet
          </p>
          {solanaConnected && solanaKey ? (
            <p className="font-mono text-sm text-white/80 break-all">
              {solanaKey.toBase58()}
            </p>
          ) : (
            <p className="text-sm text-white/30">Not connected</p>
          )}
        </div>
        <WalletMultiButton
          style={{
            background: "rgba(255,255,255,0.08)",
            borderRadius: "0.75rem",
            fontSize: "0.875rem",
            height: "2.25rem",
            padding: "0 0.875rem",
          }}
        />
      </div>

      {/* ── Email account row (if signed in) ───────────────────────────── */}
      {session && (
        <div className="flex items-center justify-between gap-3 p-5 flex-wrap">
          <div>
            <p className="text-xs text-white/40 uppercase tracking-wider mb-1.5">
              ✉ Email Account
            </p>
            <p className="text-sm text-white/70">{session.user.email}</p>
          </div>
          <div className="flex flex-col gap-1.5">
            {evmConnected && evmAddress && (
              <LinkWalletButton walletAddress={evmAddress} chain="evm" />
            )}
            {solanaConnected && solanaKey && (
              <LinkWalletButton
                walletAddress={solanaKey.toBase58()}
                chain="solana"
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
