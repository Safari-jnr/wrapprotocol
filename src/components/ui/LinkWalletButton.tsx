"use client";

import { useState } from "react";
import { useSupabase } from "@/components/providers/SupabaseProvider";

type Props = {
  walletAddress: string;
  chain: "evm" | "solana";
};

export function LinkWalletButton({ walletAddress, chain }: Props) {
  const { supabase, session } = useSupabase();
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [msg, setMsg] = useState("");

  if (!session) return null;

  async function handleLink() {
    setState("loading");
    const { error } = await supabase.from("linked_wallets").upsert(
      {
        user_id: session!.user.id,
        wallet_address: walletAddress.toLowerCase(),
        chain,
      },
      { onConflict: "user_id,wallet_address" }
    );

    if (error) {
      setMsg(error.message);
      setState("error");
    } else {
      setMsg("Wallet linked to your account.");
      setState("done");
    }
  }

  if (state === "done") {
    return <p className="text-xs text-green-400">{msg}</p>;
  }

  return (
    <div className="space-y-1">
      <button
        onClick={handleLink}
        disabled={state === "loading"}
        className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-medium text-white/70 hover:bg-white/20 disabled:opacity-50 transition-colors"
      >
        {state === "loading" ? "Linking…" : "Link wallet to account"}
      </button>
      {state === "error" && <p className="text-xs text-red-400">{msg}</p>}
    </div>
  );
}
