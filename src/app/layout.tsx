import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { WagmiProvider } from "@/components/providers/WagmiProvider";
import { SolanaProvider } from "@/components/providers/SolanaProvider";
import { SupabaseProvider } from "@/components/providers/SupabaseProvider";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";
import { WalletConnectToast } from "@/components/ui/WalletConnectToast";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });

export const metadata: Metadata = {
  title: "ExploreDapps.fun — Your Portal to Web3",
  description:
    "Discover the best DApps, track your wallets, and explore DeFi, NFTs, DAOs, GameFi and more across EVM and Solana.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${geist.variable} antialiased`}>
      <body
        className="min-h-screen flex flex-col"
        style={{ backgroundColor: "var(--color-surface-950)" }}
      >
        {/*
          WagmiProvider → SolanaProvider → SupabaseProvider order matters.
          All are "use client" components so they hydrate on the client.
          suppressHydrationWarning on body prevents wallet adapter SSR mismatches.
        */}
        <WagmiProvider>
          <SolanaProvider>
            <SupabaseProvider>
              <Navbar />
              <WalletConnectToast />
              <main className="flex-1 pt-16">{children}</main>
              <Footer />
            </SupabaseProvider>
          </SolanaProvider>
        </WagmiProvider>
      </body>
    </html>
  );
}
