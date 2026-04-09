import { Bot, Context, session, Keyboard, InlineKeyboard } from "grammy";
import { type Conversation, type ConversationFlavor, conversations, createConversation } from "@grammyjs/conversations";
import { db } from "../src/lib/db";
import * as dotenv from "dotenv";

dotenv.config();

type MyContext = Context & ConversationFlavor;

const token = process.env.TELEGRAM_BOT_TOKEN;
if (!token) {
  console.error("TELEGRAM_BOT_TOKEN is not set in .env");
  process.exit(1);
}

const bot = new Bot<MyContext>(token);

bot.use(session({ initial: () => ({}) }));
bot.use(conversations());

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
`;

/** Conversation for asking a question */
async function askQuestionConversation(conversation: Conversation<MyContext>, ctx: MyContext) {
  await ctx.reply("Как нам к вам обращаться?");
  const name = await conversation.form.text();
  
  await ctx.reply("Укажите ваш номер телефона или другой способ связи (например, Telegram username):");
  const contact = await conversation.form.text();
  
  await ctx.reply("Опишите ваш вопрос:");
  const question = await conversation.form.text();
  
  try {
    await db.application.create({
      data: {
        name,
        phone: contact,
        reason: question,
        source: "telegram_bot",
        telegramId: ctx.from?.id.toString(),
      },
    });
    await ctx.reply("Спасибо! Ваш вопрос принят. Мы свяжемся с вами в ближайшее время.");
  } catch (error) {
    console.error("Error saving question:", error);
    await ctx.reply("Произошла ошибка при сохранении вашего вопроса. Пожалуйста, попробуйте позже или свяжитесь с нами напрямую.");
  }
}

/** Conversation for booking a consultation */
async function bookingConversation(conversation: Conversation<MyContext>, ctx: MyContext) {
  await ctx.reply("Как нам к вам обращаться?");
  const name = await conversation.form.text();
  
  await ctx.reply("Укажите ваш номер телефона или способ связи:");
  const contact = await conversation.form.text();
  
  await ctx.reply("Предложите удобное для вас время (по московскому времени):");
  const time = await conversation.form.text();
  
  try {
    await db.application.create({
      data: {
        name,
        phone: contact,
        reason: "Запись на консультацию через бота",
        preferredTime: time,
        source: "telegram_bot",
        telegramId: ctx.from?.id.toString(),
      },
    });
    await ctx.reply(`Спасибо! Ваша заявка на время ${time} (МСК) принята. Мы свяжемся с вами для подтверждения.`);
  } catch (error) {
    console.error("Error saving booking:", error);
    await ctx.reply("Произошла ошибка при сохранении заявки. Пожалуйста, попробуйте позже.");
  }
}

bot.use(createConversation(askQuestionConversation));
bot.use(createConversation(bookingConversation));

bot.command("start", async (ctx) => {
  const keyboard = new Keyboard()
    .text("Задать вопрос")
    .text("Записаться на консультацию")
    .row()
    .text("Узнать расценки")
    .resized();

  await ctx.reply(
    "Здравствуйте! Вы попали в бот сайта психологических консультаций «Лад». Чем мы можем вам помочь?",
    { reply_markup: keyboard }
  );
});

bot.hears("Задать вопрос", async (ctx) => {
  await ctx.conversation.enter("askQuestionConversation");
});

bot.hears("Записаться на консультацию", async (ctx) => {
  await ctx.conversation.enter("bookingConversation");
});

bot.hears("Узнать расценки", async (ctx) => {
  await ctx.reply(PRICES_TEXT);
});

bot.on("message", async (ctx) => {
  await ctx.reply("Пожалуйста, воспользуйтесь меню ниже или командой /start для начала работы.");
});

console.log("Starting Telegram bot...");
bot.start();
