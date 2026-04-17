export type BotApplicationInput = {
  contact: string;
  name: string;
  preferredTime?: string | null;
  reason: string;
  source: "telegram_bot" | "vk_bot" | "discord_bot";
  externalUserId?: string | null;
};
