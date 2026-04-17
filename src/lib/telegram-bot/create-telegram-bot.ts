import { Bot, type Context } from "grammy";

import { loadAvailableBookingTimes } from "@/lib/application-submission";
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

import { getBookingDraft } from "./draft";
import {
  BACK_KEYBOARD,
  createContactMethodKeyboard,
  GENDER_KEYBOARD,
  MAIN_KEYBOARD,
  SKIP_KEYBOARD,
} from "./keyboards";
import {
  buildTimePreview,
  isAllowedBookingDate,
  isValidEmail,
  parseBookingDateInput,
  parseContactMethodInput,
  parseGenderInput,
} from "./parsers";
import {
  getSession,
  resetSession,
  startBookingSession,
  updateBookingSession,
  updateSession,
} from "./session";
import { submitTelegramBooking, submitTelegramQuestion } from "./submission";
import type { TelegramSessionState } from "./types";

export function createTelegramBot(token: string) {
  const bot = new Bot(token);

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
    await startBookingSession(String(ctx.chat.id));

    await ctx.reply(QUESTION_NAME_PROMPT, {
      reply_markup: BACK_KEYBOARD,
    });
  });

  bot.on("message:text", async (ctx) => {
    await handleTextMessage(ctx);
  });

  return bot;
}

async function handleTextMessage(ctx: Context) {
  const chatId = String(ctx.chat.id);
  const messageText = ctx.message?.text?.trim() ?? "";
  const session = await getSession(chatId);

  if (
    !messageText ||
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
      await submitTelegramQuestion(ctx, session, messageText);
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
        await ctx.reply(
          "На эту дату сейчас нет свободных слотов. Выберите другой день.",
          {
            reply_markup: BACK_KEYBOARD,
          }
        );
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
      if (messageText !== BOOKING_SKIP_TEXT && !isValidEmail(messageText)) {
        await ctx.reply(
          "Укажите корректный email или нажмите «Пропустить».",
          {
            reply_markup: SKIP_KEYBOARD,
          }
        );
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
      await submitTelegramBooking(ctx, session, messageText);
      return;

    default:
      await ctx.reply(UNKNOWN_COMMAND_TEXT, {
        reply_markup: MAIN_KEYBOARD,
      });
  }
}
