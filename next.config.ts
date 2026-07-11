import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Force Next.js to transpile these packages through its bundler.
  // cbw-sdk and its deps (eth-query, xtend) ship old CJS that Turbopack
  // can't resolve at build time without this.
  transpilePackages: [
    "cbw-sdk",
    "eth-query",
    "eth-json-rpc-filters",
    "json-rpc-random-id",
  ],

  // Keep these packages server-side only — they use browser APIs (indexedDB,
  // localStorage) that don't exist in the Node.js SSR environment.
  serverExternalPackages: [
    "@walletconnect/core",
    "@walletconnect/sign-client",
    "@walletconnect/universal-provider",
    "@reown/appkit",
  ],
};

export default nextConfig;
