// POST /api/feedback — receive user feedback and send via Resend email

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { Resend } from "resend";

interface FeedbackPayload {
  category: string;
  message: string;
  email?: string;
  url?: string;
}

const CATEGORY_LABELS: Record<string, string> = {
  bug: "🐛 Bug Report",
  feature: "💡 Feature Request",
  ui: "🎨 UI/UX Issue",
  security: "🔒 Security Concern",
  other: "💬 Other",
};

export async function POST(request: NextRequest) {
  let body: FeedbackPayload;

  try {
    body = await request.json() as FeedbackPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { category, message, email, url } = body;

  if (!category || !message?.trim()) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const validCategories = ["bug", "feature", "ui", "security", "other"];
  if (!validCategories.includes(category)) {
    return NextResponse.json({ error: "Invalid category" }, { status: 400 });
  }

  const apiKey = process.env.RESEND_API_KEY;

  // If no Resend key configured, log and return success (dev mode)
  if (!apiKey) {
    console.log("[api/feedback] No RESEND_API_KEY — logging only:", {
      category, message: message.trim(), email, url,
      timestamp: new Date().toISOString(),
    });
    return NextResponse.json({ ok: true }, { status: 201 });
  }

  const resend = new Resend(apiKey);

  const categoryLabel = CATEGORY_LABELS[category] ?? category;
  const fromEmail = process.env.FEEDBACK_FROM_EMAIL ?? "feedback@morkprotocol.com";
  const toEmail = process.env.FEEDBACK_TO_EMAIL ?? "safari@morkprotocol.com";

  const { error } = await resend.emails.send({
    from: fromEmail,
    to: toEmail,
    subject: `[Mork Airdrop Feedback] ${categoryLabel}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
        <h2 style="color: #7c3aed; margin-bottom: 8px;">Mork Airdrop — User Feedback</h2>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin-bottom: 24px;" />

        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #6b7280; font-size: 14px; width: 120px;">Category</td>
            <td style="padding: 8px 0; font-weight: 600;">${categoryLabel}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">From</td>
            <td style="padding: 8px 0;">${email ?? "Anonymous"}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Page</td>
            <td style="padding: 8px 0; font-size: 13px; color: #9ca3af;">${url ?? "Unknown"}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Time</td>
            <td style="padding: 8px 0; font-size: 13px; color: #9ca3af;">${new Date().toUTCString()}</td>
          </tr>
        </table>

        <div style="margin-top: 24px; background: #f9fafb; border-radius: 8px; padding: 16px;">
          <p style="color: #374151; font-size: 15px; line-height: 1.6; margin: 0; white-space: pre-wrap;">${message.trim()}</p>
        </div>
      </div>
    `,
    // Plain text fallback
    text: `Mork Airdrop Feedback\n\nCategory: ${categoryLabel}\nFrom: ${email ?? "Anonymous"}\nPage: ${url ?? "Unknown"}\n\n${message.trim()}`,
  });

  if (error) {
    console.error("[api/feedback] Resend error:", error);
    return NextResponse.json({ error: "Failed to send feedback" }, { status: 500 });
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
