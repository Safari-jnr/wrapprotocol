/**
 * EVM Claim Indexer (B5)
 * ──────────────────────
 * Watches the MorkAirdrop contract for `Claimed` events and writes them
 * to Supabase. This is the canonical sync layer — it runs server-side,
 * uses the service-role key, and is the source of truth for the DB mirror.
 *
 * Run: ts-node indexer/evm-indexer.ts
 * Or deploy as a Vercel Cron (see vercel.json) or a dedicated Node service.
 *
 * Dependencies: viem, @supabase/supabase-js
 */

import { createPublicClient, http, parseAbiItem } from "viem";
import { sepolia, mainnet, base } from "viem/chains";
import { createClient } from "@supabase/supabase-js";

// ─── Config (from env) ────────────────────────────────────────────────────────
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_EVM_CONTRACT_ADDRESS as `0x${string}`;
const RPC_URL = process.env.EVM_RPC_URL ?? "https://rpc.sepolia.org";
const CHAIN_NAME = (process.env.NEXT_PUBLIC_EVM_CHAIN ?? "sepolia") as "mainnet" | "base" | "sepolia";
const EVM_PRICE_ETH = process.env.EVM_PRICE_ETH ?? "0.01";
const TOKENS_PER_CLAIM = process.env.TOKENS_PER_CLAIM ?? "1000";

const chainMap = { mainnet, base, sepolia };
const chain = chainMap[CHAIN_NAME] ?? sepolia;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const client = createPublicClient({
  chain,
  transport: http(RPC_URL),
});

const CLAIMED_EVENT = parseAbiItem(
  "event Claimed(address indexed wallet, uint256 amount)"
);

// ─── Main loop ────────────────────────────────────────────────────────────────
async function main() {
  console.log(`[indexer] Starting EVM indexer on ${CHAIN_NAME} at ${CONTRACT_ADDRESS}`);

  // Get the last indexed block from the DB to avoid re-processing
  const { data: lastRecord } = await supabase
    .from("claims")
    .select("block_number")
    .eq("chain", "evm")
    .order("block_number", { ascending: false })
    .limit(1)
    .single();

  const fromBlock = lastRecord?.block_number
    ? BigInt(lastRecord.block_number + 1)
    : undefined; // undefined = from contract deployment block (let viem decide)

  // Watch for new Claimed events going forward
  const unwatch = client.watchContractEvent({
    address: CONTRACT_ADDRESS,
    abi: [CLAIMED_EVENT],
    eventName: "Claimed",
    onLogs: async (logs) => {
      for (const log of logs) {
        const { wallet } = log.args as { wallet: `0x${string}`; amount: bigint };
        const txHash = log.transactionHash!;
        const blockNumber = Number(log.blockNumber);

        console.log(`[indexer] Claimed: ${wallet} tx=${txHash} block=${blockNumber}`);

        const { error } = await supabase.from("claims").upsert(
          {
            wallet_address: wallet.toLowerCase(),
            chain: "evm",
            tx_hash: txHash,
            token_amount: TOKENS_PER_CLAIM,
            payment_amount: EVM_PRICE_ETH,
            claimed_at: new Date().toISOString(),
            block_number: blockNumber,
          },
          { onConflict: "tx_hash" }
        );

        if (error) {
          console.error("[indexer] Supabase upsert error:", error.message);
        }
      }
    },
    onError: (err) => {
      console.error("[indexer] watchContractEvent error:", err);
    },
    fromBlock,
  });

  console.log("[indexer] Watching for events… (Ctrl+C to stop)");

  // Keep alive
  process.on("SIGINT", () => {
    console.log("[indexer] Shutting down.");
    unwatch();
    process.exit(0);
  });
}

main().catch((err) => {
  console.error("[indexer] Fatal:", err);
  process.exit(1);
});
