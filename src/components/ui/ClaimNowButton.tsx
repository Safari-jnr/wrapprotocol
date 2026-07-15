"use client";

import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import { HeroCTA } from "./HeroCTA";

export function ClaimNowButton() {
  const { openConnectModal } = useConnectModal();
  const { isConnected } = useAccount();

  if (isConnected) {
    return <HeroCTA />;
  }

  return (
    <button
      onClick={() => openConnectModal?.()}
      className="flex-shrink-0 px-6 py-3 bg-white text-black rounded-xl font-semibold hover:bg-gray-100 transition-colors shadow-lg hover:shadow-xl"
    >
      Claim Now
    </button>
  );
}
