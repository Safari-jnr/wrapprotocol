"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { EmailSignIn } from "./EmailSignIn";

export function WalletConnectSection() {
  return (
    <div className="flex flex-col items-center gap-3 pt-4">
      {/* Wallet buttons row */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <div className="animate-scale-in">
          <ConnectButton label="Connect EVM Wallet" />
        </div>
        <span className="text-white/15 text-xs hidden sm:block">or</span>
        <div className="animate-scale-in [animation-delay:100ms] [animation-fill-mode:backwards]">
          <WalletMultiButton />
        </div>
      </div>
      {/* OR divider */}
      <div className="flex items-center gap-3 w-full max-w-xs">
        <span className="flex-1 h-px bg-white/5" />
        <span className="text-xs text-white/20">or</span>
        <span className="flex-1 h-px bg-white/5" />
      </div>
      <div className="w-full max-w-xs animate-fade-up [animation-delay:200ms] [animation-fill-mode:backwards]">
        <EmailSignIn />
      </div>
    </div>
  );
}
