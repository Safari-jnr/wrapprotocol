import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { WagmiProvider } from "@/components/providers/WagmiProvider";
import { SolanaProvider } from "@/components/providers/SolanaProvider";
import { SupabaseProvider } from "@/components/providers/SupabaseProvider";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";
import { PROJECT_NAME, TOKEN_SYMBOL } from "@/lib/constants";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" });

export const metadata: Metadata = {
  title: `${PROJECT_NAME} — Claim your ${TOKEN_SYMBOL} Airdrop`,
  description: `Connect your wallet and claim your ${TOKEN_SYMBOL} tokens in the airdrop. Fixed-price, one-claim-per-wallet on EVM + Solana.`,
  openGraph: {
    title: `${PROJECT_NAME} — Claim your ${TOKEN_SYMBOL} Airdrop`,
    description: `Connect your wallet and claim your ${TOKEN_SYMBOL} tokens. One claim per wallet.`,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${geist.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col text-white">
        <WagmiProvider>
          <SolanaProvider>
            <SupabaseProvider>
              <Navbar />
              <main className="flex-1 pt-16 animate-fade-in">{children}</main>
              <Footer />
            </SupabaseProvider>
          </SolanaProvider>
        </WagmiProvider>
      </body>
    </html>
  );
}
