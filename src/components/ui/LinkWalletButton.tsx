"use client";

import { useState } from "react";
import { useSupabase } from "@/components/providers/SupabaseProvider";

type Props = {
  walletAddress: string;
  chain: "evm" | "solana";
};

export function LinkWalletButton({ walletAddress, chain }: Props) {
  const { supabase, session } = useSupabase();
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">(
    "idle"
  );
  const [msg, setMsg] = useState("");

  if (!session) return null;

  async function handleLink() {
    setState("loading");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from("linked_wallets") as any).upsert(
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
      setMsg("Wallet linked to your account");
      setState("done");
    }
  }

  if (state === "done") {
    return (
      <p className="text-xs text-success animate-fade-in flex items-center gap-1.5">
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
        {msg}
      </p>
    );
  }

  return (
    <div className="space-y-1">
      <button
        onClick={handleLink}
        disabled={state === "loading"}
        className="text-xs font-medium px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 hover:border-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 active:scale-[0.97]"
      >
        {state === "loading" ? (
          <span className="flex items-center gap-1.5">
            <svg
              className="animate-spin h-3 w-3"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            Linking...
          </span>
        ) : (
          <span className="flex items-center gap-1.5">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            Link wallet to account
          </span>
        )}
      </button>
      {state === "error" && (
        <p className="text-xs text-error animate-fade-in">{msg}</p>
      )}
    </div>
  );
}
