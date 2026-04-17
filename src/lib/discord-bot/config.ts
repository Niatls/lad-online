export const DISCORD_PUBLIC_KEY = process.env.DISCORD_PUBLIC_KEY?.trim();
export const DISCORD_APPLICATION_ID =
  process.env.DISCORD_APPLICATION_ID?.trim();
export const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN?.trim();

export function isDiscordBotConfigured() {
  return Boolean(DISCORD_PUBLIC_KEY);
}
