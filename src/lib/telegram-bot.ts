import { createTelegramBot } from "@/lib/telegram-bot/create-telegram-bot";

const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN?.trim();

export const telegramBot = TELEGRAM_TOKEN
  ? createTelegramBot(TELEGRAM_TOKEN)
  : null;

let telegramBotInitializationPromise: Promise<void> | null = null;

export async function initializeTelegramBot() {
  if (!telegramBot) {
    return;
  }

  if (!telegramBotInitializationPromise) {
    telegramBotInitializationPromise = telegramBot.init();
  }

  await telegramBotInitializationPromise;
}

export function isTelegramBotConfigured() {
  return Boolean(TELEGRAM_TOKEN);
}
