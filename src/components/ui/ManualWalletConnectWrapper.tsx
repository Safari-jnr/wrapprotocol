"use client";

import dynamic from "next/dynamic";

export const ManualWalletConnectLazy = dynamic(
  () =>
    import("@/components/ui/ManualWalletConnect").then((m) => ({
      default: m.ManualWalletConnect,
    })),
  { ssr: false }
);
