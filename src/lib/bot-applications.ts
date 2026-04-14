import { db } from "@/lib/db";
import {
  formatApplicationNumber,
  generateApplicationVerificationCode,
} from "@/lib/applications";

type BotApplicationInput = {
  contact: string;
  name: string;
  preferredTime?: string | null;
  reason: string;
  source: "telegram_bot" | "vk_bot" | "discord_bot";
  externalUserId?: string | null;
};

export async function createBotApplication(input: BotApplicationInput) {
  const verificationCode = generateApplicationVerificationCode();
  const application = await db.application.create({
    data: {
      name: input.name,
      phone: input.contact,
      preferredTime: input.preferredTime ?? null,
      reason: input.reason,
      verificationCode,
      source: input.source,
      telegramId:
        input.source === "telegram_bot" ? input.externalUserId ?? null : null,
    },
  });

  return {
    application,
    applicationNumber: formatApplicationNumber(
      application.id,
      application.verificationCode
    ),
  };
}
