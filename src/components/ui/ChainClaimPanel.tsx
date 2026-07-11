"use client";

import { useState } from "react";
import { ClaimButton } from "./ClaimButton";
import { ClaimStatus } from "./ClaimStatus";
import { SolanaClaimButton } from "./SolanaClaimButton";

type Chain = "evm" | "solana";

export function ChainClaimPanel() {
  const [activeChain, setActiveChain] = useState<Chain>("evm");

  return (
    <div className="space-y-4">
      {/* Tab bar */}
      <div className="flex gap-1 rounded-xl bg-white/5 p-1">
        <TabButton
          label="⟠ EVM"
          subtitle="ETH / Base"
          active={activeChain === "evm"}
          onClick={() => setActiveChain("evm")}
        />
        <TabButton
          label="◎ Solana"
          subtitle="SOL"
          active={activeChain === "solana"}
          onClick={() => setActiveChain("solana")}
        />
      </div>

      {/* EVM panel */}
      {activeChain === "evm" && (
        <div className="space-y-3">
          <ClaimStatus />
          <ClaimButton />
        </div>
      )}

      {/* Solana panel */}
      {activeChain === "solana" && (
        <div className="space-y-3">
          <SolanaClaimButton />
        </div>
      )}
    </div>
  );
}

function TabButton({
  label,
  subtitle,
  active,
  onClick,
}: {
  label: string;
  subtitle: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all ${
        active
          ? "bg-violet-600 text-white shadow"
          : "text-white/50 hover:text-white/80"
      }`}
    >
      {label}
      <span
        className={`block text-xs font-normal mt-0.5 ${
          active ? "text-violet-200" : "text-white/30"
        }`}
      >
        {subtitle}
      </span>
    </button>
  );
}
