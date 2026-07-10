// POST /api/claims — mirror a successful on-chain claim to Supabase
// Called client-side after a confirmed transaction.
// This is NOT the source of truth — the contract is.
// The indexer (B5) does the canonical sync; this is a fast UX optimistic mirror.

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

interface ClaimPayload {
  wallet_address: string;
  chain: "evm" | "solana";
  tx_hash: string;
  token_amount: string;
  payment_amount: string;
  block_number?: number;
}

export async function POST(request: NextRequest) {
  let body: ClaimPayload;

  try {
    body = await request.json() as ClaimPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Basic validation
  const { wallet_address, chain, tx_hash, token_amount, payment_amount } = body;

  if (!wallet_address || !chain || !tx_hash || !token_amount || !payment_amount) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  if (!["evm", "solana"].includes(chain)) {
    return NextResponse.json({ error: "Invalid chain" }, { status: 400 });
  }

  // Normalise EVM addresses to lowercase
  const normalizedAddress =
    chain === "evm" ? wallet_address.toLowerCase() : wallet_address;

  const supabase = await createServerSupabaseClient();

  // Upsert on tx_hash to handle retries/duplicates gracefully
  const { error } = await supabase.from("claims").upsert(
    {
      wallet_address: normalizedAddress,
      chain,
      tx_hash,
      token_amount,
      payment_amount,
      block_number: body.block_number ?? null,
      claimed_at: new Date().toISOString(),
    },
    { onConflict: "tx_hash" }
  );

  if (error) {
    console.error("[api/claims] Supabase upsert error:", error.message);
    // Don't surface internal errors to the client
    return NextResponse.json({ error: "Failed to record claim" }, { status: 500 });
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
