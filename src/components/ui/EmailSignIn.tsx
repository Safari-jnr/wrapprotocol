"use client";

import { useState } from "react";
import { useSupabase } from "@/components/providers/SupabaseProvider";

type State = "idle" | "loading" | "sent" | "error";

export function EmailSignIn() {
  const { supabase } = useSupabase();
  const [email, setEmail] = useState("");
  const [state, setState] = useState<State>("idle");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setState("loading");
    setError("");

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        // Supabase will redirect here after the user clicks the magic link
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
      setState("error");
    } else {
      setState("sent");
    }
  }

  if (state === "sent") {
    return (
      <div className="rounded-xl border border-violet-500/30 bg-violet-500/10 p-4 text-center text-sm text-violet-200">
        ✉️ Check your inbox — magic link sent to <strong>{email}</strong>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <label htmlFor="email" className="sr-only">
        Email address
      </label>
      <input
        id="email"
        type="email"
        required
        placeholder="your@email.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-white placeholder-white/40 focus:border-violet-500 focus:outline-none"
      />
      <button
        type="submit"
        disabled={state === "loading"}
        className="rounded-lg bg-violet-700 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-600 disabled:opacity-60 transition-colors"
      >
        {state === "loading" ? "Sending…" : "Sign in with Email"}
      </button>
      {state === "error" && (
        <p className="text-xs text-red-400">{error}</p>
      )}
    </form>
  );
}
