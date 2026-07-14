// POST /api/message — user sends a direct message to the project owner

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { Resend } from "resend";

export async function POST(request: NextRequest) {
  let body: { name?: string; message: string };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { name, message } = body;

  if (!message?.trim()) {
    return NextResponse.json({ error: "Message is required" }, { status: 400 });
  }

  // Get client IP for context
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() ?? "unknown";

  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    // Dev mode — log only
    console.log("[api/message] No RESEND_API_KEY:", {
      name: name || "Anonymous",
      message: message.trim(),
      ip,
    });
    return NextResponse.json({ ok: true }, { status: 201 });
  }

  const resend = new Resend(apiKey);
  const fromEmail = process.env.FEEDBACK_FROM_EMAIL ?? "onboarding@resend.dev";
  const toEmail = process.env.FEEDBACK_TO_EMAIL ?? "staffatwork270@gmail.com";

  const { error } = await resend.emails.send({
    from: fromEmail,
    to: toEmail,
    subject: `[Airdrop] New message from ${name || "a user"}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
        <h2 style="color: #7c3aed; margin-bottom: 8px;">New User Message</h2>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin-bottom: 24px;" />
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #6b7280; font-size: 14px; width: 100px;">From</td>
            <td style="padding: 8px 0; font-weight: 600;">${name || "Anonymous"}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">IP</td>
            <td style="padding: 8px 0; color: #9ca3af; font-size: 13px;">${ip}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Time</td>
            <td style="padding: 8px 0; color: #9ca3af; font-size: 13px;">${new Date().toUTCString()}</td>
          </tr>
        </table>
        <div style="margin-top: 24px; background: #f9fafb; border-radius: 8px; padding: 16px;">
          <p style="color: #374151; font-size: 15px; line-height: 1.6; margin: 0; white-space: pre-wrap;">${message.trim()}</p>
        </div>
      </div>
    `,
    text: `New message from ${name || "Anonymous"}\n\n${message.trim()}\n\nIP: ${ip}`,
  });

  if (error) {
    console.error("[api/message] Resend error:", error);
    return NextResponse.json({ error: "Failed to send" }, { status: 500 });
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
