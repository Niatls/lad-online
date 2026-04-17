import { db } from "@/lib/db";

import { createEmptyBookingDraft, getBookingDraft } from "./draft";
import type { TelegramBookingDraft, TelegramSessionState } from "./types";

export type TelegramSessionRecord = Awaited<
  ReturnType<typeof db.telegramConversationSession.upsert>
>;

export async function getSession(chatId: string) {
  return db.telegramConversationSession.upsert({
    where: { chatId },
    update: {},
    create: { chatId },
  });
}

export async function updateSession(
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

export async function resetSession(chatId: string) {
  await updateSession(chatId, {
    state: "idle",
    draftName: null,
    draftContact: null,
    preferredTime: null,
  });
}

export async function startBookingSession(chatId: string) {
  return updateSession(chatId, {
    state: "booking_name",
    draftName: null,
    draftContact: JSON.stringify(createEmptyBookingDraft()),
    preferredTime: null,
  });
}

export async function updateBookingSession(
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
