// Browser-side Supabase client (uses anon/public key only)
import { createBrowserClient } from "@supabase/auth-helpers-nextjs";
import type { Database } from "./types";

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
