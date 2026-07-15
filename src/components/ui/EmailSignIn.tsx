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

    if (!supabase) {
      setState("error");
      setError("Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.");
      return;
    }

    setState("loading");
    setError("");

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
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
      <div className="rounded-xl border border-accent-500/30 bg-accent-500/10 p-4 text-center text-sm text-accent-200 animate-scale-in">
        <span className="block text-lg mb-1">✉️</span>
        Magic link sent to{" "}
        <strong className="text-accent-100">{email}</strong>
        <p className="text-xs text-accent-300/60 mt-1">
          Check your inbox and click the link to sign in.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <label htmlFor="email" className="sr-only">
        Email address
      </label>
      <div className="relative">
        <input
          id="email"
          type="email"
          required
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white placeholder-white/30 focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500/30 transition-all duration-200"
        />
      </div>
      <button
        type="submit"
        disabled={state === "loading"}
        className="w-full rounded-lg bg-gradient-to-r from-accent-500 via-violet-500 to-pink-500 px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 active:scale-[0.98]"
      >
        {state === "loading" ? (
          <span className="flex items-center justify-center gap-2">
            <svg
              className="animate-spin h-4 w-4"
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
            Sending...
          </span>
        ) : (
          "Sign in with Email"
        )}
      </button>
      {state === "error" && (
        <p className="text-xs text-error text-center animate-fade-in">{error}</p>
      )}
    </form>
  );
}
