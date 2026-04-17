export const START_QUESTION_TEXT = "Задать вопрос";
export const START_BOOKING_TEXT = "Записаться на консультацию";
export const START_PRICING_TEXT = "Узнать расценки";
export const BACK_TO_MENU_TEXT = "Вернуться в меню";
export const BOOKING_SKIP_TEXT = "Пропустить";

export const MAIN_MENU_TEXT = [
  "Здравствуйте! Вы попали в бот сайта психологических консультаций «Лад».",
  "",
  "Чем мы можем вам помочь?",
  `• ${START_QUESTION_TEXT}`,
  `• ${START_BOOKING_TEXT}`,
  `• ${START_PRICING_TEXT}`,
].join("\n");

export const PRICES_TEXT = `
💰 Наши расценки:

• Начальная консультация: 500 ₽
• Стандартная консультация: 500 - 2 500 ₽
• Консультация с подростками: 500 - 2 000 ₽
• Консультация ПТСР: 1 000 - 3 500 ₽
• Консультация с детьми: 500 - 1 500 ₽
• Семейное консультирование: 1 000 - 3 000 ₽
• После развода: 500 - 2 000 ₽
• Групповой сеанс: 1 500 - 3 000 ₽
• Свободная тематика: 500 - 1 500 ₽

Все консультации проводятся в онлайн-формате.
`.trim();

export const QUESTION_NAME_PROMPT = "Как нам к вам обращаться?";

export const QUESTION_CONTACT_PROMPT =
  "Укажите ваш номер телефона или другой способ связи, например Telegram username:";

export const QUESTION_BODY_PROMPT = "Опишите ваш вопрос:";

export const BOOKING_GENDER_PROMPT = "Укажите пол:";

export const BOOKING_AGE_PROMPT = "Укажите возраст числом:";

export const BOOKING_DATE_PROMPT =
  "Укажите дату консультации в формате ДД.ММ.ГГГГ или YYYY-MM-DD. Можно написать «сегодня» или «завтра».";

export const BOOKING_TIME_PROMPT =
  "Укажите удобное время по Москве в формате ЧЧ:ММ.";

export const BOOKING_CONTACT_PROMPT = "Выберите удобный способ связи:";

export const BOOKING_PHONE_PROMPT =
  "Укажите телефон, если хотите. Если не хотите, нажмите «Пропустить».";

export const BOOKING_EMAIL_PROMPT =
  "Укажите email, если хотите. Если не хотите, нажмите «Пропустить».";

export const BOOKING_REASON_PROMPT =
  "Опишите проблему или тему обращения, можно кратко.";

export const UNKNOWN_COMMAND_TEXT =
  "Пожалуйста, воспользуйтесь меню или начните заново командой /start.";
