import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { WagmiProvider } from "@/components/providers/WagmiProvider";
import { SolanaProvider } from "@/components/providers/SolanaProvider";
import { SupabaseProvider } from "@/components/providers/SupabaseProvider";

const geist = Geist({ subsets: ["latin"] });

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
    <html lang="en" className={geist.className}>
      <body className="bg-black text-white min-h-screen">
        <WagmiProvider>
          <SolanaProvider>
            <SupabaseProvider>
              {children}
            </SupabaseProvider>
          </SolanaProvider>
        </WagmiProvider>
      </body>
    </html>
  );
}
