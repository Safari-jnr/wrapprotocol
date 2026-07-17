"use client";

import { useState } from "react";

type FeedbackCategory = "bug" | "feature" | "ui" | "security" | "other";

const CATEGORIES: { value: FeedbackCategory; label: string; icon: string }[] = [
  { value: "bug", label: "Bug Report", icon: "🐛" },
  { value: "feature", label: "Feature Request", icon: "💡" },
  { value: "ui", label: "UI/UX Issue", icon: "🎨" },
  { value: "security", label: "Security Concern", icon: "🔒" },
  { value: "other", label: "Other", icon: "💬" },
];

type State = "idle" | "loading" | "success" | "error";

export function FeedbackSection() {
  const [category, setCategory] = useState<FeedbackCategory>("bug");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [state, setState] = useState<State>("idle");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim()) return;

    setState("loading");
    setError("");

    try {
      // Submit to our API endpoint
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category,
          message: message.trim(),
          email: email.trim() || undefined,
          url: typeof window !== "undefined" ? window.location.href : undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to submit feedback");
      }

      setState("success");
      setMessage("");
      setEmail("");
    } catch (err) {
      setState("error");
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  }

  if (state === "success") {
    return (
      <div className="glass rounded-2xl p-8 text-center space-y-4 animate-scale-in">
        <div className="text-5xl mb-2">🙏</div>
        <h3 className="text-xl font-bold text-white">Thank You!</h3>
        <p className="text-sm text-white/50 max-w-md mx-auto">
          Your feedback has been received. Our team will review it and take appropriate action.
        </p>
        <button
          onClick={() => setState("idle")}
          className="text-sm text-accent-400 hover:text-accent-300 transition-colors underline"
        >
          Submit another
        </button>
      </div>
    );
  }

  return (
    <div className="glass rounded-2xl p-6 sm:p-8 space-y-6">
      <div className="text-center space-y-2">
        <div className="text-4xl">📢</div>
        <h3 className="text-xl font-bold text-white">Do you have an error? We receive feedback. Fix error</h3>
        <p className="text-sm text-white/40 max-w-lg mx-auto">
          We receive feedback. Fix error
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 max-w-lg mx-auto">
        {/* Category selector */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              type="button"
              onClick={() => setCategory(cat.value)}
              className={`flex flex-col items-center gap-1.5 px-3 py-3 rounded-xl text-xs transition-all duration-200 ${
                category === cat.value
                  ? "bg-accent-500/20 border border-accent-500/40 text-accent-300"
                  : "bg-white/[0.03] border border-white/5 text-white/40 hover:bg-white/[0.06] hover:text-white/60"
              }`}
            >
              <span className="text-lg">{cat.icon}</span>
              <span className="font-medium">{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Message */}
        <div className="space-y-1.5">
          <label htmlFor="feedback-message" className="text-xs text-white/40 font-medium uppercase tracking-wider">
            Description
          </label>
          <textarea
            id="feedback-message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Describe the issue you experienced or the feature you'd like to see..."
            rows={4}
            required
            className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder-white/20 focus:border-accent-500/50 focus:outline-none focus:ring-1 focus:ring-accent-500/20 transition-all duration-200 resize-none"
          />
        </div>

        {/* Email (optional) */}
        <div className="space-y-1.5">
          <label htmlFor="feedback-email" className="text-xs text-white/40 font-medium uppercase tracking-wider">
            Email <span className="text-white/20 font-normal lowercase">(optional)</span>
          </label>
          <input
            id="feedback-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder-white/20 focus:border-accent-500/50 focus:outline-none focus:ring-1 focus:ring-accent-500/20 transition-all duration-200"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={state === "loading" || !message.trim()}
          className="w-full rounded-xl bg-gradient-to-r from-accent-500 via-violet-500 to-pink-500 px-6 py-3.5 text-sm font-bold text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 active:scale-[0.98] shadow-lg shadow-accent-500/20"
        >
          {state === "loading" ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Submitting...
            </span>
          ) : (
            "Submit Feedback"
          )}
        </button>

        {state === "error" && (
          <p className="text-xs text-error text-center animate-fade-in">{error}</p>
        )}
      </form>
    </div>
  );
}
