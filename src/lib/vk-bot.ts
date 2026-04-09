import { createBotApplication } from "@/lib/bot-applications";
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
import { db } from "@/lib/db";

type VkSessionState =
  | "idle"
  | "ask_question_name"
  | "ask_question_contact"
  | "ask_question_body"
  | "booking_name"
  | "booking_contact"
  | "booking_time";

type VkMessageEvent = {
  object?: {
    message?: {
      from_id?: number;
      peer_id?: number;
      text?: string;
    };
  };
  secret?: string;
  type?: string;
};

type VkSessionRecord = Awaited<
  ReturnType<typeof db.vkConversationSession.upsert>
>;

const VK_ACCESS_TOKEN = process.env.VK_COMMUNITY_TOKEN?.trim();
const VK_API_VERSION = process.env.VK_API_VERSION?.trim() || "5.199";
const VK_CONFIRMATION_TOKEN = process.env.VK_CONFIRMATION_TOKEN?.trim();
const VK_SECRET_KEY = process.env.VK_SECRET_KEY?.trim();

function normalizeMessage(text: string | undefined) {
  return text?.trim() ?? "";
}

function isMenuMessage(text: string) {
  return (
    text === START_QUESTION_TEXT ||
    text === START_BOOKING_TEXT ||
    text === START_PRICING_TEXT ||
    text === BACK_TO_MENU_TEXT
  );
}

async function callVkApi(method: string, params: Record<string, string | number>) {
  if (!VK_ACCESS_TOKEN) {
    throw new Error("VK_COMMUNITY_TOKEN is not configured");
  }

  const searchParams = new URLSearchParams({
    ...Object.fromEntries(
      Object.entries(params).map(([key, value]) => [key, String(value)])
    ),
    access_token: VK_ACCESS_TOKEN,
    v: VK_API_VERSION,
  });

  const response = await fetch(`https://api.vk.com/method/${method}`, {
    method: "POST",
    body: searchParams,
  });

  const json = (await response.json()) as {
    error?: { error_code: number; error_msg: string };
    response?: unknown;
  };

  if (json.error) {
    throw new Error(`VK API error ${json.error.error_code}: ${json.error.error_msg}`);
  }

  return json.response;
}

async function sendVkMessage(peerId: number, message: string) {
  await callVkApi("messages.send", {
    peer_id: peerId,
    message,
    random_id: Date.now(),
  });
}

export function isVkBotConfigured() {
  return Boolean(VK_ACCESS_TOKEN && VK_CONFIRMATION_TOKEN);
}

export function isValidVkSecret(secret: string | undefined) {
  if (!VK_SECRET_KEY) {
    return true;
  }

  return secret === VK_SECRET_KEY;
}

export function getVkConfirmationToken() {
  return VK_CONFIRMATION_TOKEN;
}

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
  const text = normalizeMessage(message.text);
  const session = await getSession(String(peerId));

  if (!text) {
    await sendVkMessage(peerId, MAIN_MENU_TEXT);
    return;
  }

  if (text === "/start" || text.toLowerCase() === "start") {
    await resetSession(String(peerId));
    await sendVkMessage(peerId, MAIN_MENU_TEXT);
    return;
  }

  if (text === BACK_TO_MENU_TEXT) {
    await resetSession(String(peerId));
    await sendVkMessage(peerId, MAIN_MENU_TEXT);
    return;
  }

  if (text === START_PRICING_TEXT) {
    await sendVkMessage(peerId, PRICES_TEXT);
    return;
  }

  if (text === START_QUESTION_TEXT) {
    await updateSession(String(peerId), {
      state: "ask_question_name",
      draftName: null,
      draftContact: null,
      preferredTime: null,
    });
    await sendVkMessage(peerId, QUESTION_NAME_PROMPT);
    return;
  }

  if (text === START_BOOKING_TEXT) {
    await updateSession(String(peerId), {
      state: "booking_name",
      draftName: null,
      draftContact: null,
      preferredTime: null,
    });
    await sendVkMessage(peerId, QUESTION_NAME_PROMPT);
    return;
  }

  if (isMenuMessage(text)) {
    return;
  }

  switch (session.state as VkSessionState) {
    case "ask_question_name":
      await updateSession(String(peerId), {
        state: "ask_question_contact",
        draftName: text,
      });
      await sendVkMessage(peerId, QUESTION_CONTACT_PROMPT);
      return;

    case "ask_question_contact":
      await updateSession(String(peerId), {
        state: "ask_question_body",
        draftContact: text,
      });
      await sendVkMessage(peerId, QUESTION_BODY_PROMPT);
      return;

    case "ask_question_body":
      await createQuestionApplication(peerId, fromId, session, text);
      return;

    case "booking_name":
      await updateSession(String(peerId), {
        state: "booking_contact",
        draftName: text,
      });
      await sendVkMessage(peerId, BOOKING_CONTACT_PROMPT);
      return;

    case "booking_contact":
      await updateSession(String(peerId), {
        state: "booking_time",
        draftContact: text,
      });
      await sendVkMessage(peerId, BOOKING_TIME_PROMPT);
      return;

    case "booking_time":
      await createBookingApplication(peerId, session, text);
      return;

    default:
      await sendVkMessage(peerId, UNKNOWN_COMMAND_TEXT);
  }
}

async function createQuestionApplication(
  peerId: number,
  fromId: string | null,
  session: VkSessionRecord,
  question: string
) {
  if (!session.draftName || !session.draftContact) {
    await resetSession(String(peerId));
    await sendVkMessage(
      peerId,
      "Не удалось восстановить шаги диалога. Пожалуйста, начните заново."
    );
    return;
  }

  const { applicationNumber } = await createBotApplication({
    name: session.draftName,
    contact: session.draftContact,
    reason: question,
    source: "vk_bot",
    externalUserId: fromId,
  });

  await resetSession(String(peerId));
  await sendVkMessage(
    peerId,
    `Спасибо! Ваш вопрос принят. Номер заявки: ${applicationNumber}. Мы свяжемся с вами в ближайшее время.`
  );
}

async function createBookingApplication(
  peerId: number,
  session: VkSessionRecord,
  preferredTime: string
) {
  if (!session.draftName || !session.draftContact) {
    await resetSession(String(peerId));
    await sendVkMessage(
      peerId,
      "Не удалось восстановить шаги записи. Пожалуйста, начните заново."
    );
    return;
  }

  const { applicationNumber } = await createBotApplication({
    name: session.draftName,
    contact: session.draftContact,
    preferredTime,
    reason: "Запись на консультацию через VK-бота",
    source: "vk_bot",
  });

  await resetSession(String(peerId));
  await sendVkMessage(
    peerId,
    `Спасибо! Ваша заявка принята. Номер заявки: ${applicationNumber}. Мы свяжемся с вами для подтверждения времени.`
  );
}

async function getSession(peerId: string) {
  return db.vkConversationSession.upsert({
    where: { peerId },
    update: {},
    create: { peerId },
  });
}

async function updateSession(
  peerId: string,
  data: Partial<{
    state: VkSessionState;
    draftName: string | null;
    draftContact: string | null;
    preferredTime: string | null;
  }>
) {
  return db.vkConversationSession.upsert({
    where: { peerId },
    update: data,
    create: {
      peerId,
      ...data,
    },
  });
}

async function resetSession(peerId: string) {
  await updateSession(peerId, {
    state: "idle",
    draftName: null,
    draftContact: null,
    preferredTime: null,
  });
}
