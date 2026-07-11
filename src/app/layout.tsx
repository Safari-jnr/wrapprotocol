import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { WagmiProvider } from "@/components/providers/WagmiProvider";
import { SolanaProvider } from "@/components/providers/SolanaProvider";
import { SupabaseProvider } from "@/components/providers/SupabaseProvider";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });

export const metadata: Metadata = {
  title: "Mork Airdrop",
  description: "Mork Airdrop — claim your MORK tokens",
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
              <main className="flex-1 pt-16">{children}</main>
              <Footer />
            </SupabaseProvider>
          </SolanaProvider>
        </WagmiProvider>
      </body>
    </html>
  );
}
