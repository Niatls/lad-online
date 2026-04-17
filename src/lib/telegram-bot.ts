import { Bot, Context, Keyboard } from "grammy";

import { createApplicationSubmission, loadAvailableBookingTimes } from "@/lib/application-submission";
import { createBotApplication } from "@/lib/bot-applications";
import { applicationContactMethods, applicationFormSchema } from "@/lib/applications";
import { formatDateKey, getMinimumBookingDate } from "@/lib/booking-availability";
import {
  BACK_TO_MENU_TEXT,
  BOOKING_AGE_PROMPT,
  BOOKING_CONTACT_PROMPT,
  BOOKING_DATE_PROMPT,
  BOOKING_EMAIL_PROMPT,
  BOOKING_GENDER_PROMPT,
  BOOKING_PHONE_PROMPT,
  BOOKING_REASON_PROMPT,
  BOOKING_SKIP_TEXT,
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
  | "booking_gender"
  | "booking_age"
  | "booking_date"
  | "booking_time"
  | "booking_contact_method"
  | "booking_phone"
  | "booking_email"
  | "booking_reason";

type TelegramBotContext = Context;

type TelegramSessionRecord = Awaited<
  ReturnType<typeof db.telegramConversationSession.upsert>
>;

type TelegramBookingDraft = {
  age: string;
  contactMethod: string;
  email: string;
  gender: string;
  name: string;
  phone: string;
  preferredDate: string;
  preferredTime: string;
};

const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN?.trim();

const MAIN_KEYBOARD = new Keyboard()
  .text(START_QUESTION_TEXT)
  .text(START_BOOKING_TEXT)
  .row()
  .text(START_PRICING_TEXT)
  .resized();

const BACK_KEYBOARD = new Keyboard().text(BACK_TO_MENU_TEXT).resized();
const GENDER_KEYBOARD = new Keyboard()
  .text("Мужской")
  .text("Женский")
  .row()
  .text(BACK_TO_MENU_TEXT)
  .resized();
const SKIP_KEYBOARD = new Keyboard()
  .text(BOOKING_SKIP_TEXT)
  .row()
  .text(BACK_TO_MENU_TEXT)
  .resized();

function createContactMethodKeyboard() {
  const keyboard = new Keyboard();

  applicationContactMethods.forEach((method, index) => {
    keyboard.text(method.label);
    if (index % 2 === 1) {
      keyboard.row();
    }
  });

  return keyboard.row().text(BACK_TO_MENU_TEXT).resized();
}

function createEmptyBookingDraft(): TelegramBookingDraft {
  return {
    age: "",
    contactMethod: "",
    email: "",
    gender: "",
    name: "",
    phone: "",
    preferredDate: "",
    preferredTime: "",
  };
}

function getBookingDraft(session: TelegramSessionRecord) {
  if (!session.draftContact) {
    return createEmptyBookingDraft();
  }

  try {
    const parsed = JSON.parse(session.draftContact) as Partial<TelegramBookingDraft>;
    return {
      ...createEmptyBookingDraft(),
      ...parsed,
    };
  } catch {
    return createEmptyBookingDraft();
  }
}

async function updateBookingSession(
  chatId: string,
  state: TelegramSessionState,
  patch: Partial<TelegramBookingDraft>
) {
  const session = await getSession(chatId);
  const nextDraft = {
    ...getBookingDraft(session),
    ...patch,
  };

  return updateSession(chatId, {
    state,
    draftName: null,
    draftContact: JSON.stringify(nextDraft),
    preferredTime: nextDraft.preferredTime || nextDraft.preferredDate || null,
  });
}

function parseGenderInput(value: string) {
  const normalized = value.trim().toLowerCase();

  if (normalized === "мужской" || normalized === "male") {
    return "male";
  }

  if (normalized === "женский" || normalized === "female") {
    return "female";
  }

  return null;
}

function parseContactMethodInput(value: string) {
  const normalized = value.trim().toLowerCase();

  return (
    applicationContactMethods.find(
      (method) =>
        method.value.toLowerCase() === normalized ||
        method.label.toLowerCase() === normalized
    ) ?? null
  );
}

function parseBookingDateInput(value: string) {
  const normalized = value.trim().toLowerCase();
  const today = getMinimumBookingDate();

  if (normalized === "сегодня") {
    return formatDateKey(today);
  }

  if (normalized === "завтра") {
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return formatDateKey(tomorrow);
  }

  const isoMatch = normalized.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoMatch) {
    return normalized;
  }

  const ruMatch = normalized.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
  if (!ruMatch) {
    return null;
  }

  return `${ruMatch[3]}-${ruMatch[2]}-${ruMatch[1]}`;
}

function isAllowedBookingDate(dateKey: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) {
    return false;
  }

  return dateKey >= formatDateKey(getMinimumBookingDate());
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function buildTimePreview(times: readonly string[]) {
  if (times.length === 0) {
    return "Свободных слотов на эту дату сейчас нет.";
  }

  const preview = times.slice(0, 12).join(", ");
  return times.length > 12 ? `${preview}...` : preview;
}

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
      draftContact: JSON.stringify(createEmptyBookingDraft()),
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
        await updateBookingSession(chatId, "booking_gender", {
          name: messageText,
        });
        await ctx.reply(BOOKING_GENDER_PROMPT, {
          reply_markup: GENDER_KEYBOARD,
        });
        return;

      case "booking_gender": {
        const gender = parseGenderInput(messageText);

        if (!gender) {
          await ctx.reply(
            "Выберите пол кнопкой ниже или введите «мужской» / «женский».",
            {
              reply_markup: GENDER_KEYBOARD,
            }
          );
          return;
        }

        await updateBookingSession(chatId, "booking_age", {
          gender,
        });
        await ctx.reply(BOOKING_AGE_PROMPT, {
          reply_markup: BACK_KEYBOARD,
        });
        return;
      }

      case "booking_age": {
        const age = Number.parseInt(messageText, 10);

        if (!Number.isFinite(age) || age < 12 || age > 120) {
          await ctx.reply("Укажите возраст числом от 12 до 120.", {
            reply_markup: BACK_KEYBOARD,
          });
          return;
        }

        await updateBookingSession(chatId, "booking_date", {
          age: String(age),
        });
        await ctx.reply(BOOKING_DATE_PROMPT, {
          reply_markup: BACK_KEYBOARD,
        });
        return;
      }

      case "booking_date": {
        const preferredDate = parseBookingDateInput(messageText);

        if (!preferredDate || !isAllowedBookingDate(preferredDate)) {
          await ctx.reply(
            "Введите дату в формате ДД.ММ.ГГГГ или YYYY-MM-DD. Можно также написать «сегодня» или «завтра».",
            {
              reply_markup: BACK_KEYBOARD,
            }
          );
          return;
        }

        const availableTimes = await loadAvailableBookingTimes(preferredDate);

        if (availableTimes.length === 0) {
          await ctx.reply("На эту дату сейчас нет свободных слотов. Выберите другой день.", {
            reply_markup: BACK_KEYBOARD,
          });
          return;
        }

        await updateBookingSession(chatId, "booking_time", {
          preferredDate,
          preferredTime: "",
        });
        await ctx.reply(
          `${BOOKING_TIME_PROMPT}\n\nПервые доступные слоты: ${buildTimePreview(availableTimes)}`,
          {
            reply_markup: BACK_KEYBOARD,
          }
        );
        return;
      }

      case "booking_time": {
        const draft = getBookingDraft(session);

        if (!/^\d{2}:\d{2}$/.test(messageText)) {
          await ctx.reply("Введите время в формате ЧЧ:ММ, например 14:30.", {
            reply_markup: BACK_KEYBOARD,
          });
          return;
        }

        const availableTimes = draft.preferredDate
          ? await loadAvailableBookingTimes(draft.preferredDate)
          : [];

        if (!availableTimes.includes(messageText)) {
          await ctx.reply(
            `Это время недоступно. Выберите другой слот.\n\nПервые доступные варианты: ${buildTimePreview(availableTimes)}`,
            {
              reply_markup: BACK_KEYBOARD,
            }
          );
          return;
        }

        await updateBookingSession(chatId, "booking_contact_method", {
          preferredTime: `${draft.preferredDate}T${messageText}`,
        });
        await ctx.reply(BOOKING_CONTACT_PROMPT, {
          reply_markup: createContactMethodKeyboard(),
        });
        return;
      }

      case "booking_contact_method": {
        const contactMethod = parseContactMethodInput(messageText);

        if (!contactMethod) {
          await ctx.reply("Выберите способ связи кнопкой ниже.", {
            reply_markup: createContactMethodKeyboard(),
          });
          return;
        }

        await updateBookingSession(chatId, "booking_phone", {
          contactMethod: contactMethod.value,
        });
        await ctx.reply(BOOKING_PHONE_PROMPT, {
          reply_markup: SKIP_KEYBOARD,
        });
        return;
      }

      case "booking_phone":
        await updateBookingSession(chatId, "booking_email", {
          phone: messageText === BOOKING_SKIP_TEXT ? "" : messageText,
        });
        await ctx.reply(BOOKING_EMAIL_PROMPT, {
          reply_markup: SKIP_KEYBOARD,
        });
        return;

      case "booking_email":
        if (
          messageText !== BOOKING_SKIP_TEXT &&
          !isValidEmail(messageText)
        ) {
          await ctx.reply("Укажите корректный email или нажмите «Пропустить».", {
            reply_markup: SKIP_KEYBOARD,
          });
          return;
        }

        await updateBookingSession(chatId, "booking_reason", {
          email: messageText === BOOKING_SKIP_TEXT ? "" : messageText,
        });
        await ctx.reply(BOOKING_REASON_PROMPT, {
          reply_markup: BACK_KEYBOARD,
        });
        return;

      case "booking_reason":
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
      externalUserId: ctx.from?.id.toString(),
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

async function createBookingApplication(
  ctx: TelegramBotContext,
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
