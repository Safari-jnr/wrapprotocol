"use client";

import dynamic from "next/dynamic";

export const ManualWalletConnectLazy = dynamic(
  () =>
    import("./ManualWalletConnect").then((m) => ({
      default: m.ManualWalletConnect,
    })),
  { ssr: false }
);
