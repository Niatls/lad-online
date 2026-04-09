import { NextResponse } from "next/server";

import {
  isTelegramBotConfigured,
  telegramBot,
} from "@/lib/telegram-bot";

export const runtime = "nodejs";

function isValidSecret(request: Request) {
  const expectedSecret = process.env.TELEGRAM_WEBHOOK_SECRET?.trim();

  if (!expectedSecret) {
    return true;
  }

  return (
    request.headers.get("x-telegram-bot-api-secret-token") === expectedSecret
  );
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    configured: isTelegramBotConfigured(),
  });
}

export async function POST(request: Request) {
  if (!isTelegramBotConfigured() || !telegramBot) {
    return NextResponse.json(
      {
        ok: false,
        message: "Telegram bot is not configured.",
      },
      { status: 503 }
    );
  }

  if (!isValidSecret(request)) {
    return NextResponse.json(
      {
        ok: false,
        message: "Invalid webhook secret.",
      },
      { status: 401 }
    );
  }

  try {
    const update = await request.json();
    await telegramBot.handleUpdate(update);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to process Telegram webhook", error);

    return NextResponse.json(
      {
        ok: false,
        message: "Failed to process Telegram webhook.",
      },
      { status: 500 }
    );
  }
}
