// GET /api/stats — public endpoint returning aggregate airdrop stats

import { NextResponse } from "next/server";
import { createServerAnonClient } from "@/lib/supabase/server";

// Cache for 60 seconds — fine for public display stats
export const revalidate = 60;

export async function GET() {
  const supabase = await createServerAnonClient();

  if (!supabase) {
    return NextResponse.json(
      { total_claimed: 0, total_claimed_evm: 0, total_claimed_solana: 0, total_raised_eth: "0", total_raised_sol: "0" },
      { status: 200 }
    );
  }

  const { data, error } = await supabase
    .from("sale_stats")
    .select("total_claimed_evm, total_claimed_solana, total_raised_eth, total_raised_sol, updated_at")
    .eq("id", 1)
    .single();

  if (error || !data) {
    return NextResponse.json(
      { total_claimed: 0, total_raised_eth: "0", total_raised_sol: "0" },
      { status: 200 }
    );
  }

  return NextResponse.json({
    total_claimed: data.total_claimed_evm + data.total_claimed_solana,
    total_claimed_evm: data.total_claimed_evm,
    total_claimed_solana: data.total_claimed_solana,
    total_raised_eth: data.total_raised_eth,
    total_raised_sol: data.total_raised_sol,
    updated_at: data.updated_at,
  });
}
