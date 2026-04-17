import { Keyboard } from "grammy";

import { applicationContactMethods } from "@/lib/applications";
import {
  BACK_TO_MENU_TEXT,
  BOOKING_SKIP_TEXT,
  START_BOOKING_TEXT,
  START_PRICING_TEXT,
  START_QUESTION_TEXT,
} from "@/lib/bot-copy";

export const MAIN_KEYBOARD = new Keyboard()
  .text(START_QUESTION_TEXT)
  .text(START_BOOKING_TEXT)
  .row()
  .text(START_PRICING_TEXT)
  .resized();

export const BACK_KEYBOARD = new Keyboard().text(BACK_TO_MENU_TEXT).resized();

export const GENDER_KEYBOARD = new Keyboard()
  .text("Мужской")
  .text("Женский")
  .row()
  .text(BACK_TO_MENU_TEXT)
  .resized();

export const SKIP_KEYBOARD = new Keyboard()
  .text(BOOKING_SKIP_TEXT)
  .row()
  .text(BACK_TO_MENU_TEXT)
  .resized();

export function createContactMethodKeyboard() {
  const keyboard = new Keyboard();

  applicationContactMethods.forEach((method, index) => {
    keyboard.text(method.label);
    if (index % 2 === 1) {
      keyboard.row();
    }
  });

  return keyboard.row().text(BACK_TO_MENU_TEXT).resized();
}
