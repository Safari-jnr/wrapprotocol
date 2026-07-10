"use client";

import { useState } from "react";
import {
  useAccount,
  useBalance,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { MORK_AIRDROP_ABI } from "@/lib/abi";
import {
  EVM_CONTRACT_ADDRESS,
  TOKENS_PER_CLAIM,
  TOKEN_SYMBOL,
  EVM_EXPLORER,
  EVM_CHAIN,
  PRICE_PERCENTAGE,
  EVM_MIN_PRICE_ETH,
  EVM_MAX_PRICE_ETH,
  computeClaimPrice,
  formatEth,
} from "@/lib/constants";

type TxState = "idle" | "confirming" | "pending" | "success" | "error";

export function ClaimButton() {
  const { address, isConnected } = useAccount();
  const [txState, setTxState] = useState<TxState>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();
  const [actualPaid, setActualPaid] = useState<bigint>(0n);

  // Live ETH balance — used to compute 30% price
  const { data: balanceData } = useBalance({
    address,
    query: { enabled: !!address },
  });

  // Computed claim price: 30% of balance, clamped to [min, max]
  const balanceWei = balanceData?.value ?? 0n;
  const claimPriceWei = computeClaimPrice(balanceWei);
  const claimPriceEth = formatEth(claimPriceWei);

  // Read: has this wallet already claimed?
  const { data: hasClaimed } = useReadContract({
    address: EVM_CONTRACT_ADDRESS,
    abi: MORK_AIRDROP_ABI,
    functionName: "hasClaimed",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  // Read: is sale active?
  const { data: saleActive } = useReadContract({
    address: EVM_CONTRACT_ADDRESS,
    abi: MORK_AIRDROP_ABI,
    functionName: "saleActive",
    query: { enabled: isConnected },
  });

  const { writeContractAsync } = useWriteContract();

  const { isLoading: isWaiting } = useWaitForTransactionReceipt({
    hash: txHash,
    query: {
      enabled: !!txHash,
      select: async (receipt) => {
        if (receipt.status === "success") {
          setTxState("success");
          // Mirror to Supabase (non-critical, fire-and-forget)
          fetch("/api/claims", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              wallet_address: address,
              chain: "evm",
              tx_hash: receipt.transactionHash,
              token_amount: TOKENS_PER_CLAIM.toString(),
              payment_amount: claimPriceEth,
              block_number: Number(receipt.blockNumber),
            }),
          }).catch(() => {});
        } else {
          setTxState("error");
          setErrorMsg("Transaction reverted on-chain.");
        }
        return receipt;
      },
    },
  });

  async function handleClaim() {
    try {
      setTxState("confirming");
      setErrorMsg("");
      setActualPaid(claimPriceWei);

      const hash = await writeContractAsync({
        address: EVM_CONTRACT_ADDRESS,
        abi: MORK_AIRDROP_ABI,
        functionName: "claim",
        value: claimPriceWei,
      });
      setTxHash(hash);
      setTxState("pending");
    } catch (err: unknown) {
      setTxState("error");
      const msg = err instanceof Error ? err.message : "Transaction rejected.";
      setErrorMsg(
        msg.includes("User rejected") || msg.includes("user rejected")
          ? "You rejected the transaction."
          : msg.length > 120
          ? msg.slice(0, 120) + "…"
          : msg
      );
    }
  }

  const explorerBase = EVM_EXPLORER[EVM_CHAIN];

  if (!isConnected) return null;

  // Success state
  if (txState === "success" && txHash) {
    return (
      <div className="rounded-xl border border-green-500/30 bg-green-500/10 p-4 text-sm text-green-300 space-y-2">
        <p className="font-semibold">
          🎉 Claimed {TOKENS_PER_CLAIM.toString()} {TOKEN_SYMBOL}!
        </p>
        <p className="text-green-400/70">
          You paid {formatEth(actualPaid)} ETH ({PRICE_PERCENTAGE}% of your balance)
        </p>
        <a
          href={`${explorerBase}/tx/${txHash}`}
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-green-200 block"
        >
          View transaction ↗
        </a>
      </div>
    );
  }

  // Already claimed
  if (hasClaimed) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-white/50 text-center">
        This wallet has already claimed.
      </div>
    );
  }

  // Sale not live
  if (!saleActive) {
    return (
      <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-4 text-sm text-yellow-300 text-center">
        Sale is not live yet. Check back soon.
      </div>
    );
  }

  const isLoading = txState === "confirming" || txState === "pending" || isWaiting;
  const hasBalance = balanceWei > 0n;

  return (
    <div className="space-y-3">
      {/* Price breakdown */}
      <div className="rounded-lg bg-white/5 border border-white/10 px-4 py-3 space-y-1">
        <div className="flex justify-between text-sm">
          <span className="text-white/50">Your ETH balance</span>
          <span className="text-white/80 font-mono">
            {formatEth(balanceWei)} ETH
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-white/50">
            Price ({PRICE_PERCENTAGE}% of balance)
          </span>
          <span className="text-violet-300 font-mono font-bold">
            {claimPriceEth} ETH
          </span>
        </div>
        <p className="text-xs text-white/30 pt-1">
          Clamped to [{EVM_MIN_PRICE_ETH} ETH min → {EVM_MAX_PRICE_ETH} ETH max]
        </p>
      </div>

      <button
        onClick={handleClaim}
        disabled={isLoading || !hasBalance}
        className="w-full rounded-xl bg-violet-600 px-6 py-3 font-bold text-white hover:bg-violet-500 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
      >
        {txState === "confirming"
          ? "Waiting for signature…"
          : txState === "pending" || isWaiting
          ? "Transaction pending…"
          : `Pay ${claimPriceEth} ETH → Claim ${TOKENS_PER_CLAIM.toString()} ${TOKEN_SYMBOL}`}
      </button>

      {!hasBalance && (
        <p className="text-xs text-yellow-400 text-center">
          Your wallet has no ETH balance. Add ETH to claim.
        </p>
      )}

      {txState === "error" && (
        <p className="text-xs text-red-400 text-center">{errorMsg}</p>
      )}

      {txState === "pending" && txHash && (
        <a
          href={`${explorerBase}/tx/${txHash}`}
          target="_blank"
          rel="noopener noreferrer"
          className="block text-center text-xs text-violet-400 underline"
        >
          Track on explorer ↗
        </a>
      )}
    </div>
  );
}
