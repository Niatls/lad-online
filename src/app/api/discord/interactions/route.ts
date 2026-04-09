import { NextResponse } from "next/server";

import {
  handleDiscordInteraction,
  isDiscordBotConfigured,
  verifyDiscordRequest,
} from "@/lib/discord-bot";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({
    ok: true,
    configured: isDiscordBotConfigured(),
  });
}

export async function POST(request: Request) {
  if (!isDiscordBotConfigured()) {
    return NextResponse.json(
      {
        ok: false,
        message: "Discord bot is not configured.",
      },
      { status: 503 }
    );
  }

  const body = await request.text();
  const signature = request.headers.get("x-signature-ed25519");
  const timestamp = request.headers.get("x-signature-timestamp");

  if (!verifyDiscordRequest(body, signature, timestamp)) {
    return NextResponse.json(
      {
        ok: false,
        message: "Invalid Discord request signature.",
      },
      { status: 401 }
    );
  }

  try {
    const interaction = JSON.parse(body) as Parameters<
      typeof handleDiscordInteraction
    >[0];

    const response = await handleDiscordInteraction(interaction);
    return NextResponse.json(response);
  } catch (error) {
    console.error("Failed to process Discord interaction", error);

    return NextResponse.json(
      {
        ok: false,
        message: "Failed to process Discord interaction.",
      },
      { status: 500 }
    );
  }
}
