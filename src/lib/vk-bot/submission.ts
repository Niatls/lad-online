import { createBotApplication } from "@/lib/bot-applications";

import { sendVkMessage } from "./api";
import { resetVkSession } from "./session";
import type { VkSessionRecord } from "./types";

export async function submitVkQuestion(
  peerId: number,
  fromId: string | null,
  session: VkSessionRecord,
  question: string
) {
  if (!session.draftName || !session.draftContact) {
    await resetVkSession(String(peerId));
    await sendVkMessage(
      peerId,
      "Не удалось восстановить шаги диалога. Пожалуйста, начните заново."
    );
    return;
  }

  const { applicationNumber } = await createBotApplication({
    name: session.draftName,
    contact: session.draftContact,
    reason: question,
    source: "vk_bot",
    externalUserId: fromId,
  });

  await resetVkSession(String(peerId));
  await sendVkMessage(
    peerId,
    `Спасибо! Ваш вопрос принят. Код заявки: ${applicationNumber}. Мы свяжемся с вами в ближайшее время.`
  );
}

export async function submitVkBooking(
  peerId: number,
  session: VkSessionRecord,
  preferredTime: string
) {
  if (!session.draftName || !session.draftContact) {
    await resetVkSession(String(peerId));
    await sendVkMessage(
      peerId,
      "Не удалось восстановить шаги записи. Пожалуйста, начните заново."
    );
    return;
  }

  const { applicationNumber } = await createBotApplication({
    name: session.draftName,
    contact: session.draftContact,
    preferredTime,
    reason: "Запись на консультацию через VK-бота",
    source: "vk_bot",
  });

  await resetVkSession(String(peerId));
  await sendVkMessage(
    peerId,
    `Спасибо! Ваша заявка принята. Код заявки: ${applicationNumber}. Мы свяжемся с вами для подтверждения времени.`
  );
}
