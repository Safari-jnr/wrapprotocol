// POST /api/feedback — receive user feedback and issue reports
// Stores feedback for the team to review

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

interface FeedbackPayload {
  category: string;
  message: string;
  email?: string;
  url?: string;
}

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

  // Log to server console for development
  console.log("[api/feedback] Received feedback:", {
    category,
    message: message.trim().slice(0, 500),
    email: email ?? "anonymous",
    url: url ?? "unknown",
    timestamp: new Date().toISOString(),
  });

  // In production, store to Supabase or send to Slack/email
  // For now, acknowledge receipt
  return NextResponse.json({
    ok: true,
    message: "Feedback received. Thank you!",
  }, { status: 201 });
}
