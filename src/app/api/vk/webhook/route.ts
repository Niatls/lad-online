import { NextResponse } from "next/server";

import {
  getVkConfirmationToken,
  handleVkEvent,
  isValidVkSecret,
  isVkBotConfigured,
} from "@/lib/vk-bot";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({
    ok: true,
    configured: isVkBotConfigured(),
  });
}

export async function POST(request: Request) {
  const event = (await request.json()) as {
    secret?: string;
    type?: string;
  };

  if (!isValidVkSecret(event.secret)) {
    return new Response("invalid secret", { status: 401 });
  }

  if (event.type === "confirmation") {
    const confirmationToken = getVkConfirmationToken();

    if (!confirmationToken) {
      return new Response("VK confirmation token is not configured", {
        status: 503,
      });
    }

    return new Response(confirmationToken, { status: 200 });
  }

  if (!isVkBotConfigured()) {
    return new Response("VK bot is not configured", { status: 503 });
  }

  try {
    await handleVkEvent(event);
    return new Response("ok", { status: 200 });
  } catch (error) {
    console.error("Failed to process VK webhook", error);
    return new Response("error", { status: 500 });
  }
}
