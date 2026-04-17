import type { Context } from "grammy";

import { createApplicationSubmission } from "@/lib/application-submission";
import { applicationFormSchema } from "@/lib/applications";
import {
  MAIN_KEYBOARD,
} from "./keyboards";
import { createBotApplication } from "@/lib/bot-applications";
import { getBookingDraft } from "./draft";
import { resetSession } from "./session";
import type { TelegramSessionRecord } from "./session";

export async function submitTelegramQuestion(
  ctx: Context,
  session: TelegramSessionRecord,
  question: string
) {
  const chatId = ctx.chat?.id ? String(ctx.chat.id) : null;

  if (!chatId) {
    return;
  }

  if (!session.draftName || !session.draftContact) {
    await resetSession(chatId);
    await ctx.reply(
      "Не удалось восстановить шаги диалога. Пожалуйста, начните заново через меню.",
      {
        reply_markup: MAIN_KEYBOARD,
      }
    );
    return;
  }

  try {
    const { applicationNumber } = await createBotApplication({
      name: session.draftName,
      contact: session.draftContact,
      reason: question,
      source: "telegram_bot",
      externalUserId: ctx.from?.id?.toString(),
    });

    await resetSession(chatId);
    await ctx.reply(
      `Спасибо! Ваш вопрос принят. Код заявки: ${applicationNumber}. Мы свяжемся с вами в ближайшее время.`,
      {
        reply_markup: MAIN_KEYBOARD,
      }
    );
  } catch (error) {
    console.error("Failed to save Telegram question", error);
    await ctx.reply(
      "Произошла ошибка при сохранении вопроса. Пожалуйста, попробуйте позже.",
      {
        reply_markup: MAIN_KEYBOARD,
      }
    );
  }
}

export async function submitTelegramBooking(
  ctx: Context,
  session: TelegramSessionRecord,
  reason: string
) {
  const chatId = ctx.chat?.id ? String(ctx.chat.id) : null;
  const draft = getBookingDraft(session);

  if (!chatId) {
    return;
  }

  if (
    !draft.name ||
    !draft.gender ||
    !draft.age ||
    !draft.preferredTime ||
    !draft.contactMethod
  ) {
    await resetSession(chatId);
    await ctx.reply(
      "Не удалось восстановить шаги записи. Пожалуйста, начните заново через меню.",
      {
        reply_markup: MAIN_KEYBOARD,
      }
    );
    return;
  }

  try {
    const payload = applicationFormSchema.parse({
      name: draft.name,
      gender: draft.gender,
      age: Number(draft.age),
      preferredTime: draft.preferredTime,
      reason,
      contactMethod: draft.contactMethod,
      phone: draft.phone,
      email: draft.email,
    });
    const { applicationNumber } = await createApplicationSubmission(payload, {
      source: "telegram_bot",
      externalUserId: ctx.from?.id?.toString() ?? null,
    });

    await resetSession(chatId);
    await ctx.reply(
      `Спасибо! Ваша заявка принята.\nКод заявки: ${applicationNumber}.\nСохраните его, чтобы потом проверить заявку.\nМы свяжемся с вами для подтверждения времени.`,
      {
        reply_markup: MAIN_KEYBOARD,
      }
    );
  } catch (error) {
    console.error("Failed to save Telegram booking", error);

    const message =
      error instanceof Error && error.message === "PREFERRED_TIME_UNAVAILABLE"
        ? "Это время уже занято или недоступно. Начните запись заново и выберите другой слот."
        : "Произошла ошибка при сохранении заявки. Пожалуйста, попробуйте позже.";

    await resetSession(chatId);
    await ctx.reply(message, {
      reply_markup: MAIN_KEYBOARD,
    });
  }
}
