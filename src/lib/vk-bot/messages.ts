import {
  BACK_TO_MENU_TEXT,
  START_BOOKING_TEXT,
  START_PRICING_TEXT,
  START_QUESTION_TEXT,
} from "@/lib/bot-copy";

export function normalizeVkMessage(text: string | undefined) {
  return text?.trim() ?? "";
}

export function isVkMenuMessage(text: string) {
  return (
    text === START_QUESTION_TEXT ||
    text === START_BOOKING_TEXT ||
    text === START_PRICING_TEXT ||
    text === BACK_TO_MENU_TEXT
  );
}
