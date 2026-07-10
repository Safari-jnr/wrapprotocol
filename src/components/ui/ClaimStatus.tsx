"use client";

import { useReadContract } from "wagmi";
import { useAccount } from "wagmi";
import { MORK_AIRDROP_ABI } from "@/lib/abi";
import { EVM_CONTRACT_ADDRESS } from "@/lib/constants";

type Status = "not-connected" | "loading" | "eligible" | "claimed" | "inactive";

export function ClaimStatus() {
  const { address, isConnected } = useAccount();

  const { data: hasClaimed, isLoading: loadingClaimed } = useReadContract({
    address: EVM_CONTRACT_ADDRESS,
    abi: MORK_AIRDROP_ABI,
    functionName: "hasClaimed",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const { data: saleActive, isLoading: loadingSale } = useReadContract({
    address: EVM_CONTRACT_ADDRESS,
    abi: MORK_AIRDROP_ABI,
    functionName: "saleActive",
    query: { enabled: !!address },
  });

  const status: Status = !isConnected
    ? "not-connected"
    : loadingClaimed || loadingSale
    ? "loading"
    : !saleActive
    ? "inactive"
    : hasClaimed
    ? "claimed"
    : "eligible";

  const statusConfig: Record<Status, { label: string; color: string; dot: string }> = {
    "not-connected": { label: "Connect wallet to check eligibility", color: "text-white/50", dot: "bg-white/30" },
    loading: { label: "Checking eligibility…", color: "text-white/60", dot: "bg-yellow-400 animate-pulse" },
    eligible: { label: "Eligible to claim", color: "text-green-400", dot: "bg-green-400" },
    claimed: { label: "Already claimed", color: "text-white/50", dot: "bg-white/30" },
    inactive: { label: "Sale not live", color: "text-yellow-400", dot: "bg-yellow-400" },
  };

  const { label, color, dot } = statusConfig[status];

  return (
    <div className={`flex items-center gap-2 text-sm font-medium ${color}`}>
      <span className={`h-2 w-2 rounded-full ${dot}`} />
      {label}
    </div>
  );
}
