// Browser-side Supabase client — uses @supabase/ssr (replaces auth-helpers-nextjs)
import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./types";
import type { SupabaseClient } from "@supabase/supabase-js";

export function createClient(): SupabaseClient<Database> | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    if (typeof window !== "undefined") {
      console.warn(
        "[supabase/client] Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. " +
          "Supabase features will be disabled."
      );
    }
    return null;
  }

  return createBrowserClient<Database>(url, anonKey);
}
