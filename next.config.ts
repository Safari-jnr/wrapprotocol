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
};

export default nextConfig;
