import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { WagmiProvider } from "@/components/providers/WagmiProvider";
import { SolanaProvider } from "@/components/providers/SolanaProvider";
import { SupabaseProvider } from "@/components/providers/SupabaseProvider";
import { Navbar } from "@/components/ui/Navbar";
import { PROJECT_NAME, TOKEN_SYMBOL } from "@/lib/constants";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });

export const metadata: Metadata = {
  title: `${PROJECT_NAME} — Claim your ${TOKEN_SYMBOL}`,
  description: `Connect your wallet and claim your ${TOKEN_SYMBOL} tokens in the Mork Airdrop.`,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${geist.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#0a0a0f] text-white">
        {/*
          Provider order matters:
          - WagmiProvider wraps everything needing EVM wallet access
          - SolanaProvider wraps everything needing Solana wallet access
          - SupabaseProvider wraps everything needing auth/session
          All are Client Components, so Server Components lower in the tree
          still render on the server — they're just passed as children.
        */}
        <WagmiProvider>
          <SolanaProvider>
            <SupabaseProvider>
              <Navbar />
              <main className="flex-1">{children}</main>
              <footer className="border-t border-white/10 py-6 text-center text-xs text-white/30">
                © {new Date().getFullYear()} Mork Airdrop — Contract is the source
                of truth. This UI is display only.
              </footer>
            </SupabaseProvider>
          </SolanaProvider>
        </WagmiProvider>
      </body>
    </html>
  );
}
