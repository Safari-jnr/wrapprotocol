"use client";

// Client Component wrapper — allows ssr:false dynamic import
// (Next.js 16: dynamic with ssr:false is only permitted in Client Components)
import dynamic from "next/dynamic";

export const WalletConnectSectionLazy = dynamic(
  () =>
    import("@/components/ui/WalletConnectSection").then((m) => ({
      default: m.WalletConnectSection,
    })),
  { ssr: false }
);
