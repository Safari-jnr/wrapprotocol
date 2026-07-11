"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { EmailSignIn } from "./EmailSignIn";

export function LandingCTAs() {
  return (
    <div className="flex flex-col items-center gap-4 pt-4">
      {/* Wallet connect row */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <ConnectButton label="Connect EVM Wallet" />
        <WalletMultiButton
          style={{
            background: "rgba(124,58,237,0.85)",
            borderRadius: "0.75rem",
            fontSize: "0.9375rem",
            height: "2.625rem",
            padding: "0 1.25rem",
            fontWeight: "700",
          }}
        />
      </div>

      <span className="text-white/30 text-sm">or sign in with email</span>

      <div className="w-full max-w-xs">
        <EmailSignIn />
      </div>
    </div>
  );
}
