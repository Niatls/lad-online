import { MAIN_MENU_TEXT, PRICES_TEXT } from "@/lib/bot-copy";

import { MODAL_CUSTOM_ID } from "./constants";
import { createTextInput, createModal, createMessageResponse } from "./responses";

export async function handleDiscordCommand(interaction: {
  data?: { name?: string };
}) {
  switch (interaction.data?.name) {
    case "start":
      return createMessageResponse(MAIN_MENU_TEXT);
    case "prices":
      return createMessageResponse(PRICES_TEXT);
    case "question":
      return createModal(MODAL_CUSTOM_ID.QUESTION, "Задать вопрос", [
        createTextInput("name", "Как к вам обращаться?", 1),
        createTextInput("contact", "Телефон или способ связи", 1),
        createTextInput("question", "Ваш вопрос", 2),
      ]);
    case "booking":
      return createModal(MODAL_CUSTOM_ID.BOOKING, "Запись на консультацию", [
        createTextInput("name", "Как к вам обращаться?", 1),
        createTextInput("contact", "Телефон или способ связи", 1),
        createTextInput("preferredTime", "Удобное время по Москве", 2),
      ]);
    default:
      return createMessageResponse("Неизвестная команда.");
  }
}
