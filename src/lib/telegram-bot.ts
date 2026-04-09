import { Bot, Context, Keyboard } from "grammy";

import { createBotApplication } from "@/lib/bot-applications";
import {
  BACK_TO_MENU_TEXT,
  BOOKING_CONTACT_PROMPT,
  BOOKING_TIME_PROMPT,
  MAIN_MENU_TEXT,
  PRICES_TEXT,
  QUESTION_BODY_PROMPT,
  QUESTION_CONTACT_PROMPT,
  QUESTION_NAME_PROMPT,
  START_BOOKING_TEXT,
  START_PRICING_TEXT,
  START_QUESTION_TEXT,
  UNKNOWN_COMMAND_TEXT,
} from "@/lib/bot-copy";
import { db } from "@/lib/db";

type TelegramSessionState =
  | "idle"
  | "ask_question_name"
  | "ask_question_contact"
  | "ask_question_body"
  | "booking_name"
  | "booking_contact"
  | "booking_time";

type TelegramBotContext = Context;

type TelegramSessionRecord = Awaited<
  ReturnType<typeof db.telegramConversationSession.upsert>
>;

const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

const MAIN_KEYBOARD = new Keyboard()
  .text(START_QUESTION_TEXT)
  .text(START_BOOKING_TEXT)
  .row()
  .text(START_PRICING_TEXT)
  .resized();

const BACK_KEYBOARD = new Keyboard().text(BACK_TO_MENU_TEXT).resized();

function createBot() {
  if (!TELEGRAM_TOKEN) {
    return null;
  }

  const bot = new Bot(TELEGRAM_TOKEN);

  bot.command("start", async (ctx) => {
    await resetSession(String(ctx.chat.id));
    await ctx.reply(MAIN_MENU_TEXT, { reply_markup: MAIN_KEYBOARD });
  });

  bot.hears(BACK_TO_MENU_TEXT, async (ctx) => {
    await resetSession(String(ctx.chat.id));
    await ctx.reply("Возвращаемся в главное меню.", {
      reply_markup: MAIN_KEYBOARD,
    });
  });

  bot.hears(START_PRICING_TEXT, async (ctx) => {
    await ctx.reply(PRICES_TEXT, { reply_markup: MAIN_KEYBOARD });
  });

  bot.hears(START_QUESTION_TEXT, async (ctx) => {
    await updateSession(String(ctx.chat.id), {
      state: "ask_question_name",
      draftName: null,
      draftContact: null,
      preferredTime: null,
    });

    await ctx.reply(QUESTION_NAME_PROMPT, {
      reply_markup: BACK_KEYBOARD,
    });
  });

  bot.hears(START_BOOKING_TEXT, async (ctx) => {
    await updateSession(String(ctx.chat.id), {
      state: "booking_name",
      draftName: null,
      draftContact: null,
      preferredTime: null,
    });

    await ctx.reply(QUESTION_NAME_PROMPT, {
      reply_markup: BACK_KEYBOARD,
    });
  });

  bot.on("message:text", async (ctx) => {
    const chatId = String(ctx.chat.id);
    const messageText = ctx.message.text.trim();
    const session = await getSession(chatId);

    if (
      messageText.startsWith("/") ||
      messageText === START_QUESTION_TEXT ||
      messageText === START_BOOKING_TEXT ||
      messageText === START_PRICING_TEXT ||
      messageText === BACK_TO_MENU_TEXT
    ) {
      return;
    }

    switch (session.state as TelegramSessionState) {
      case "ask_question_name":
        await updateSession(chatId, {
          state: "ask_question_contact",
          draftName: messageText,
        });
        await ctx.reply(QUESTION_CONTACT_PROMPT, {
          reply_markup: BACK_KEYBOARD,
        });
        return;

      case "ask_question_contact":
        await updateSession(chatId, {
          state: "ask_question_body",
          draftContact: messageText,
        });
        await ctx.reply(QUESTION_BODY_PROMPT, {
          reply_markup: BACK_KEYBOARD,
        });
        return;

      case "ask_question_body":
        await createQuestionApplication(ctx, session, messageText);
        return;

      case "booking_name":
        await updateSession(chatId, {
          state: "booking_contact",
          draftName: messageText,
        });
        await ctx.reply(BOOKING_CONTACT_PROMPT, {
          reply_markup: BACK_KEYBOARD,
        });
        return;

      case "booking_contact":
        await updateSession(chatId, {
          state: "booking_time",
          draftContact: messageText,
        });
        await ctx.reply(BOOKING_TIME_PROMPT, {
          reply_markup: BACK_KEYBOARD,
        });
        return;

      case "booking_time":
        await createBookingApplication(ctx, session, messageText);
        return;

      default:
        await ctx.reply(UNKNOWN_COMMAND_TEXT, {
          reply_markup: MAIN_KEYBOARD,
        });
    }
  });

  return bot;
}

async function createQuestionApplication(
  ctx: TelegramBotContext,
  session: TelegramSessionRecord,
  question: string
) {
  if (!session.draftName || !session.draftContact) {
    await resetSession(String(ctx.chat.id));
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
      externalUserId: ctx.from?.id.toString(),
    });

    await resetSession(String(ctx.chat.id));
    await ctx.reply(
      `Спасибо! Ваш вопрос принят. Номер заявки: ${applicationNumber}. Мы свяжемся с вами в ближайшее время.`,
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

async function createBookingApplication(
  ctx: TelegramBotContext,
  session: TelegramSessionRecord,
  preferredTime: string
) {
  if (!session.draftName || !session.draftContact) {
    await resetSession(String(ctx.chat.id));
    await ctx.reply(
      "Не удалось восстановить шаги записи. Пожалуйста, начните заново через меню.",
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
      preferredTime,
      reason: "Запись на консультацию через Telegram-бота",
      source: "telegram_bot",
      externalUserId: ctx.from?.id.toString(),
    });

    await resetSession(String(ctx.chat.id));
    await ctx.reply(
      `Спасибо! Ваша заявка принята. Номер заявки: ${applicationNumber}. Мы свяжемся с вами для подтверждения времени.`,
      {
        reply_markup: MAIN_KEYBOARD,
      }
    );
  } catch (error) {
    console.error("Failed to save Telegram booking", error);
    await ctx.reply(
      "Произошла ошибка при сохранении заявки. Пожалуйста, попробуйте позже.",
      {
        reply_markup: MAIN_KEYBOARD,
      }
    );
  }
}

async function getSession(chatId: string) {
  return db.telegramConversationSession.upsert({
    where: { chatId },
    update: {},
    create: { chatId },
  });
}

async function updateSession(
  chatId: string,
  data: Partial<{
    state: TelegramSessionState;
    draftName: string | null;
    draftContact: string | null;
    preferredTime: string | null;
  }>
) {
  return db.telegramConversationSession.upsert({
    where: { chatId },
    update: data,
    create: {
      chatId,
      ...data,
    },
  });
}

async function resetSession(chatId: string) {
  await updateSession(chatId, {
    state: "idle",
    draftName: null,
    draftContact: null,
    preferredTime: null,
  });
}

export const telegramBot = createBot();

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
