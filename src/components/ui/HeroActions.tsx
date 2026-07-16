"use client";

/**
 * HeroActions — Client island for the two interactive hero buttons.
 *
 * Isolated here so page.tsx can remain a Server Component (required for
 * StatsBar which uses next/headers via supabase/server.ts).
 *
 * Manages dropdown open state so ConnectOrMessage never overlaps HeroCTA.
 */

import { useState } from "react";
import { ConnectOrMessage } from "@/components/ui/ConnectOrMessage";
import { HeroCTA } from "@/components/ui/HeroCTA";

export function HeroActions() {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <div className="flex flex-col items-center gap-5 w-full">
      {/* Primary button: handles connect + auto-claim in one click */}
      <HeroCTA />

      {/* Secondary: manual wallet connect (always rendered for its own state) */}
      <div className="flex flex-col items-center gap-3 w-full">
        {!dropdownOpen && (
          <>
            <div className="flex items-center gap-3 w-full max-w-xs">
              <span className="flex-1 h-px bg-white/10" />
              <span className="text-xs text-white/25">or</span>
              <span className="flex-1 h-px bg-white/10" />
            </div>
          </>
        )}
        <ConnectOrMessage onOpenChange={setDropdownOpen} />
      </div>
    </div>
  );
}
