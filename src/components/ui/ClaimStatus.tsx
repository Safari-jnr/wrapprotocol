"use client";

import { useReadContract } from "wagmi";
import { useAccount } from "wagmi";
import { AIRDROP_ABI } from "@/lib/abi";
import { EVM_CONTRACT_ADDRESS } from "@/lib/constants";

type Status = "not-connected" | "loading" | "eligible" | "claimed" | "inactive";

export function ClaimStatus() {
  const { address, isConnected } = useAccount();

  const { data: hasClaimed, isLoading: loadingClaimed } = useReadContract({
    address: EVM_CONTRACT_ADDRESS,
    abi: AIRDROP_ABI,
    functionName: "hasClaimed",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const { data: saleActive, isLoading: loadingSale } = useReadContract({
    address: EVM_CONTRACT_ADDRESS,
    abi: AIRDROP_ABI,
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

  const statusConfig: Record<
    Status,
    { label: string; color: string; dot: string; bg: string }
  > = {
    "not-connected": {
      label: "Connect wallet to check eligibility",
      color: "text-white/40",
      dot: "bg-white/20",
      bg: "bg-white/[0.03]",
    },
    loading: {
      label: "Checking eligibility\u2026",
      color: "text-white/50",
      dot: "bg-warning animate-pulse",
      bg: "bg-white/[0.03]",
    },
    eligible: {
      label: "Eligible to claim",
      color: "text-success",
      dot: "bg-success",
      bg: "bg-success/[0.06]",
    },
    claimed: {
      label: "Already claimed",
      color: "text-white/40",
      dot: "bg-white/20",
      bg: "bg-white/[0.03]",
    },
    inactive: {
      label: "Sale not live",
      color: "text-warning",
      dot: "bg-warning",
      bg: "bg-warning/[0.06]",
    },
  };

  const { label, color, dot, bg } = statusConfig[status];

  return (
    <div
      className={`flex items-center gap-2 text-sm font-medium px-3 py-1.5 rounded-lg ${color} ${bg} transition-all duration-300`}
    >
      <span className={`h-2 w-2 rounded-full ${dot} transition-all duration-300`} />
      {label}
    </div>
  );
}
