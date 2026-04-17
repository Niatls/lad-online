import { db } from "@/lib/db";
import {
  formatApplicationNumber,
  generateApplicationVerificationCode,
} from "@/lib/applications";

import type { BotApplicationInput } from "./types";

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
