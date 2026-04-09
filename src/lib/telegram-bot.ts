import { Bot, Context, Keyboard } from "grammy";

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

const START_QUESTION_TEXT = "Задать вопрос";
const START_BOOKING_TEXT = "Записаться на консультацию";
const START_PRICING_TEXT = "Узнать расценки";
const BACK_TO_MENU_TEXT = "Вернуться в меню";

const MAIN_KEYBOARD = new Keyboard()
  .text(START_QUESTION_TEXT)
  .text(START_BOOKING_TEXT)
  .row()
  .text(START_PRICING_TEXT)
  .resized();

const BACK_KEYBOARD = new Keyboard().text(BACK_TO_MENU_TEXT).resized();

const PRICES_TEXT = `
💰 Наши расценки:

• Начальная консультация: 500 ₽
• Стандартная консультация: 500 — 2 500 ₽
• Консультация с подростками: 500 — 2 000 ₽
• Консультация ПТСР: 1 000 — 3 500 ₽
• Консультация с детьми: 500 — 1 500 ₽
• Семейное консультирование: 1 000 — 3 000 ₽
• После развода: 500 — 2 000 ₽
• Групповой сеанс: 1 500 — 3 000 ₽
• Свободная тематика: 500 — 1 500 ₽

Все консультации проводятся в онлайн-формате.
`.trim();

function createBot() {
  if (!TELEGRAM_TOKEN) {
    return null;
  }

  const bot = new Bot(TELEGRAM_TOKEN);

  bot.command("start", async (ctx) => {
    await resetSession(String(ctx.chat.id));
    await ctx.reply(
      "Здравствуйте! Вы попали в бот сайта психологических консультаций «Лад». Чем мы можем вам помочь?",
      { reply_markup: MAIN_KEYBOARD }
    );
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

    await ctx.reply("Как нам к вам обращаться?", {
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

    await ctx.reply("Как нам к вам обращаться?", {
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
        await ctx.reply(
          "Укажите ваш номер телефона или другой способ связи, например Telegram username:",
          { reply_markup: BACK_KEYBOARD }
        );
        return;

      case "ask_question_contact":
        await updateSession(chatId, {
          state: "ask_question_body",
          draftContact: messageText,
        });
        await ctx.reply("Опишите ваш вопрос:", {
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
        await ctx.reply("Укажите ваш номер телефона или способ связи:", {
          reply_markup: BACK_KEYBOARD,
        });
        return;

      case "booking_contact":
        await updateSession(chatId, {
          state: "booking_time",
          draftContact: messageText,
        });
        await ctx.reply(
          "Предложите удобное для вас время по Москве, например: завтра 18:00",
          { reply_markup: BACK_KEYBOARD }
        );
        return;

      case "booking_time":
        await createBookingApplication(ctx, session, messageText);
        return;

      default:
        await ctx.reply(
          "Пожалуйста, воспользуйтесь меню ниже или командой /start для начала работы.",
          { reply_markup: MAIN_KEYBOARD }
        );
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
    const application = await db.application.create({
      data: {
        name: session.draftName,
        phone: session.draftContact,
        reason: question,
        source: "telegram_bot",
        telegramId: ctx.from?.id.toString(),
      },
    });

    await resetSession(String(ctx.chat.id));
    await ctx.reply(
      `Спасибо! Ваш вопрос принят. Номер заявки: LAD-${application.id
        .toString()
        .padStart(6, "0")}. Мы свяжемся с вами в ближайшее время.`,
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
    const application = await db.application.create({
      data: {
        name: session.draftName,
        phone: session.draftContact,
        reason: "Запись на консультацию через Telegram-бота",
        preferredTime,
        source: "telegram_bot",
        telegramId: ctx.from?.id.toString(),
      },
    });

    await resetSession(String(ctx.chat.id));
    await ctx.reply(
      `Спасибо! Ваша заявка принята. Номер заявки: LAD-${application.id
        .toString()
        .padStart(6, "0")}. Мы свяжемся с вами для подтверждения времени.`,
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

export function isTelegramBotConfigured() {
  return Boolean(TELEGRAM_TOKEN);
}
