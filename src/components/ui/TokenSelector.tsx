"use client";

/**
 * TokenSelector — lets users pick which token to pay with when claiming MORK.
 *
 * Reads each supported token's balance on-chain (individual hooks, no .map())
 * and shows it alongside the token icon.
 */

import { useAccount, useBalance, useReadContract } from "wagmi";
import { ERC20_ABI } from "@/lib/abi";
import {
  SUPPORTED_PAYMENT_TOKENS,
  ERC20_PAYMENT_TOKENS,
  formatTokenAmount,
  type TokenInfo,
} from "@/lib/constants";

interface TokenSelectorProps {
  selectedToken: string;
  onSelect: (token: TokenInfo) => void;
  ethPriceWei: bigint;
  tokenBalance: bigint;
}

export function TokenSelector({ selectedToken, onSelect }: TokenSelectorProps) {
  const { address } = useAccount();

  // ── Individual balance reads (no .map() violations) ─────────────────────
  const { data: ethBal } = useBalance({ address, query: { enabled: !!address } });

  const usdcAddr = ERC20_PAYMENT_TOKENS[0]?.address as `0x${string}` | undefined;
  const cbbtcAddr = ERC20_PAYMENT_TOKENS[1]?.address as `0x${string}` | undefined;
  const usdtAddr = ERC20_PAYMENT_TOKENS[2]?.address as `0x${string}` | undefined;
  const daiAddr = ERC20_PAYMENT_TOKENS[3]?.address as `0x${string}` | undefined;

  const qUsdc = useReadContract({
    address: usdcAddr, abi: ERC20_ABI, functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!address && !!usdcAddr },
  });
  const qCbbtc = useReadContract({
    address: cbbtcAddr, abi: ERC20_ABI, functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!address && !!cbbtcAddr },
  });
  const qUsdt = useReadContract({
    address: usdtAddr, abi: ERC20_ABI, functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!address && !!usdtAddr },
  });
  const qDai = useReadContract({
    address: daiAddr, abi: ERC20_ABI, functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!address && !!daiAddr },
  });

  const erc20Balances: bigint[] = [
    (qUsdc.data as bigint) ?? 0n,
    (qCbbtc.data as bigint) ?? 0n,
    (qUsdt.data as bigint) ?? 0n,
    (qDai.data as bigint) ?? 0n,
  ];

  // ── Native ETH token (first in list) ───────────────────────────────────
  const ethToken = SUPPORTED_PAYMENT_TOKENS[0];

  return (
    <div className="space-y-2">
      <label className="text-xs font-semibold text-white/40 uppercase tracking-wider">
        Pay with
      </label>

      <div className="grid grid-cols-1 gap-1.5">
        {/* Native ETH */}
        <TokenOption
          token={ethToken}
          balance={ethBal?.value ?? 0n}
          decimals={18}
          isSelected={selectedToken === ethToken.address}
          isConnected={!!address}
          onClick={() => onSelect(ethToken)}
        />

        {/* ERC-20 tokens */}
        {ERC20_PAYMENT_TOKENS.map((tok: TokenInfo, i: number) => (
          <TokenOption
            key={tok.address}
            token={tok}
            balance={erc20Balances[i]}
            decimals={tok.decimals}
            isSelected={selectedToken === tok.address}
            isConnected={!!address}
            onClick={() => onSelect(tok)}
          />
        ))}
      </div>
    </div>
  );
}

// ── Individual token option row ───────────────────────────────────────────────

function TokenOption({
  token,
  balance,
  decimals,
  isSelected,
  isConnected,
  onClick,
}: {
  token: TokenInfo;
  balance: bigint;
  decimals: number;
  isSelected: boolean;
  isConnected: boolean;
  onClick: () => void;
}) {
  const isNative = token.address === "0x0000000000000000000000000000000000000000";
  const hasBalance = balance > 0n;

  return (
    <button
      type="button"
      onClick={!isNative && isConnected && !hasBalance ? undefined : onClick}
      disabled={isConnected && !hasBalance && !isNative}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all text-left w-full ${
        isSelected
          ? "border-accent-500/50 bg-accent-500/10"
          : "border-white/10 bg-white/5 hover:bg-white/10"
      } ${
        isConnected && !hasBalance && !isNative
          ? "opacity-40 cursor-not-allowed"
          : "cursor-pointer"
      }`}
    >
      <TokenIcon token={token} size="sm" />

      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold text-white truncate">
          {token.symbol}
        </div>
        <div className="text-xs text-white/40 truncate">{token.name}</div>
      </div>

      <div className="text-right shrink-0">
        {isConnected ? (
          <>
            <div className="text-sm font-mono text-white/70">
              {formatTokenAmount(balance, decimals)}
            </div>
            <div className="text-[10px] text-white/30">{token.symbol}</div>
          </>
        ) : (
          <div className="text-xs text-white/30">&mdash;</div>
        )}
      </div>

      {isSelected && (
        <svg className="w-4 h-4 text-accent-400 shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
            clipRule="evenodd"
          />
        </svg>
      )}
    </button>
  );
}

// ── Token icon ────────────────────────────────────────────────────────────────

function TokenIcon({ token, size = "md" }: { token: TokenInfo; size?: "sm" | "md" }) {
  const sizeClass = size === "sm" ? "w-6 h-6" : "w-8 h-8";

  return (
    <div
      className={`${sizeClass} rounded-full bg-linear-to-br from-purple-500 to-blue-600 flex items-center justify-center text-xs font-bold text-white shrink-0 overflow-hidden`}
    >
      {token.logo ? (
        <img
          src={token.logo}
          alt={token.symbol}
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
      ) : (
        token.symbol.slice(0, 2)
      )}
    </div>
  );
}
