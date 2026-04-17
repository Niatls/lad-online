import type { TelegramBookingDraft, TelegramSessionRecord } from "./types";

export function createEmptyBookingDraft(): TelegramBookingDraft {
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

export function getBookingDraft(session: TelegramSessionRecord) {
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
