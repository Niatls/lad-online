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

import { sendVkMessage } from "./api";
import { isVkMenuMessage, normalizeVkMessage } from "./messages";
import { getVkSession, resetVkSession, updateVkSession } from "./session";
import { submitVkBooking, submitVkQuestion } from "./submission";
import type { VkMessageEvent, VkSessionState } from "./types";

export async function handleVkEvent(event: VkMessageEvent) {
  if (event.type !== "message_new") {
    return;
  }

  const message = event.object?.message;

  if (!message?.peer_id) {
    return;
  }

  const peerId = message.peer_id;
  const fromId = message.from_id?.toString() ?? null;
  const text = normalizeVkMessage(message.text);
  const session = await getVkSession(String(peerId));

  if (!text) {
    await sendVkMessage(peerId, MAIN_MENU_TEXT);
    return;
  }

  if (text === "/start" || text.toLowerCase() === "start") {
    await resetVkSession(String(peerId));
    await sendVkMessage(peerId, MAIN_MENU_TEXT);
    return;
  }

  if (text === BACK_TO_MENU_TEXT) {
    await resetVkSession(String(peerId));
    await sendVkMessage(peerId, MAIN_MENU_TEXT);
    return;
  }

  if (text === START_PRICING_TEXT) {
    await sendVkMessage(peerId, PRICES_TEXT);
    return;
  }

  if (text === START_QUESTION_TEXT) {
    await updateVkSession(String(peerId), {
      state: "ask_question_name",
      draftName: null,
      draftContact: null,
      preferredTime: null,
    });
    await sendVkMessage(peerId, QUESTION_NAME_PROMPT);
    return;
  }

  if (text === START_BOOKING_TEXT) {
    await updateVkSession(String(peerId), {
      state: "booking_name",
      draftName: null,
      draftContact: null,
      preferredTime: null,
    });
    await sendVkMessage(peerId, QUESTION_NAME_PROMPT);
    return;
  }

  if (isVkMenuMessage(text)) {
    return;
  }

  switch (session.state as VkSessionState) {
    case "ask_question_name":
      await updateVkSession(String(peerId), {
        state: "ask_question_contact",
        draftName: text,
      });
      await sendVkMessage(peerId, QUESTION_CONTACT_PROMPT);
      return;

    case "ask_question_contact":
      await updateVkSession(String(peerId), {
        state: "ask_question_body",
        draftContact: text,
      });
      await sendVkMessage(peerId, QUESTION_BODY_PROMPT);
      return;

    case "ask_question_body":
      await submitVkQuestion(peerId, fromId, session, text);
      return;

    case "booking_name":
      await updateVkSession(String(peerId), {
        state: "booking_contact",
        draftName: text,
      });
      await sendVkMessage(peerId, BOOKING_CONTACT_PROMPT);
      return;

    case "booking_contact":
      await updateVkSession(String(peerId), {
        state: "booking_time",
        draftContact: text,
      });
      await sendVkMessage(peerId, BOOKING_TIME_PROMPT);
      return;

    case "booking_time":
      await submitVkBooking(peerId, session, text);
      return;

    default:
      await sendVkMessage(peerId, UNKNOWN_COMMAND_TEXT);
  }
}
