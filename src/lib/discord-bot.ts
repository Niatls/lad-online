import nacl from "tweetnacl";

import { createBotApplication } from "@/lib/bot-applications";
import { MAIN_MENU_TEXT, PRICES_TEXT } from "@/lib/bot-copy";

const DISCORD_PUBLIC_KEY = process.env.DISCORD_PUBLIC_KEY?.trim();
const DISCORD_APPLICATION_ID = process.env.DISCORD_APPLICATION_ID?.trim();
const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN?.trim();

const INTERACTION_RESPONSE = {
  PONG: 1,
  CHANNEL_MESSAGE_WITH_SOURCE: 4,
  MODAL: 9,
} as const;

const INTERACTION_TYPE = {
  PING: 1,
  APPLICATION_COMMAND: 2,
  MESSAGE_COMPONENT: 3,
  APPLICATION_COMMAND_AUTOCOMPLETE: 4,
  MODAL_SUBMIT: 5,
} as const;

const MODAL_CUSTOM_ID = {
  BOOKING: "booking_modal",
  QUESTION: "question_modal",
} as const;

function toBuffer(value: string) {
  return Buffer.from(value, "utf8");
}

function fromHex(value: string) {
  return Buffer.from(value, "hex");
}

function getStringValue(
  components: Array<{
    components?: Array<{ custom_id?: string; value?: string }>;
  }>,
  customId: string
) {
  for (const row of components) {
    for (const component of row.components ?? []) {
      if (component.custom_id === customId) {
        return component.value?.trim() ?? "";
      }
    }
  }

  return "";
}

function createTextInput(customId: string, label: string, style: 1 | 2) {
  return {
    type: 1,
    components: [
      {
        type: 4,
        custom_id: customId,
        label,
        style,
        required: true,
      },
    ],
  };
}

function createModal(customId: string, title: string, fields: Array<ReturnType<typeof createTextInput>>) {
  return {
    type: INTERACTION_RESPONSE.MODAL,
    data: {
      custom_id: customId,
      title,
      components: fields,
    },
  };
}

function createMessageResponse(content: string) {
  return {
    type: INTERACTION_RESPONSE.CHANNEL_MESSAGE_WITH_SOURCE,
    data: {
      content,
    },
  };
}

export function isDiscordBotConfigured() {
  return Boolean(DISCORD_PUBLIC_KEY);
}

export function verifyDiscordRequest(
  body: string,
  signature: string | null,
  timestamp: string | null
) {
  if (!DISCORD_PUBLIC_KEY || !signature || !timestamp) {
    return false;
  }

  return nacl.sign.detached.verify(
    toBuffer(timestamp + body),
    fromHex(signature),
    fromHex(DISCORD_PUBLIC_KEY)
  );
}

export async function handleDiscordInteraction(interaction: {
  type: number;
  data?: {
    name?: string;
    custom_id?: string;
    components?: Array<{
      components?: Array<{ custom_id?: string; value?: string }>;
    }>;
  };
  member?: { user?: { id?: string } };
  user?: { id?: string };
}) {
  if (interaction.type === INTERACTION_TYPE.PING) {
    return { type: INTERACTION_RESPONSE.PONG };
  }

  if (interaction.type === INTERACTION_TYPE.APPLICATION_COMMAND) {
    return handleDiscordCommand(interaction);
  }

  if (interaction.type === INTERACTION_TYPE.MODAL_SUBMIT) {
    return handleDiscordModalSubmit(interaction);
  }

  return createMessageResponse("Пока это действие не поддерживается.");
}

async function handleDiscordCommand(interaction: {
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

async function handleDiscordModalSubmit(interaction: {
  data?: {
    custom_id?: string;
    components?: Array<{
      components?: Array<{ custom_id?: string; value?: string }>;
    }>;
  };
  member?: { user?: { id?: string } };
  user?: { id?: string };
}) {
  const components = interaction.data?.components ?? [];
  const userId = interaction.member?.user?.id ?? interaction.user?.id ?? null;
  const name = getStringValue(components, "name");
  const contact = getStringValue(components, "contact");

  if (!name || !contact) {
    return createMessageResponse(
      "Не удалось прочитать поля формы. Попробуйте еще раз."
    );
  }

  if (interaction.data?.custom_id === MODAL_CUSTOM_ID.QUESTION) {
    const question = getStringValue(components, "question");
    const { applicationNumber } = await createBotApplication({
      name,
      contact,
      reason: question || "Вопрос из Discord-бота",
      source: "discord_bot",
      externalUserId: userId,
    });

    return createMessageResponse(
      `Спасибо! Ваш вопрос принят. Номер заявки: ${applicationNumber}.`
    );
  }

  if (interaction.data?.custom_id === MODAL_CUSTOM_ID.BOOKING) {
    const preferredTime = getStringValue(components, "preferredTime");
    const { applicationNumber } = await createBotApplication({
      name,
      contact,
      preferredTime,
      reason: "Запись на консультацию через Discord-бота",
      source: "discord_bot",
      externalUserId: userId,
    });

    return createMessageResponse(
      `Спасибо! Ваша заявка принята. Номер заявки: ${applicationNumber}.`
    );
  }

  return createMessageResponse("Неизвестная форма.");
}

export async function registerDiscordCommands() {
  if (!DISCORD_APPLICATION_ID || !DISCORD_BOT_TOKEN) {
    throw new Error(
      "DISCORD_APPLICATION_ID and DISCORD_BOT_TOKEN are required to register commands."
    );
  }

  const commands = [
    {
      name: "start",
      description: "Показать главное меню бота",
    },
    {
      name: "prices",
      description: "Показать текущие расценки",
    },
    {
      name: "question",
      description: "Отправить вопрос психологу",
    },
    {
      name: "booking",
      description: "Оставить заявку на консультацию",
    },
  ];

  const response = await fetch(
    `https://discord.com/api/v10/applications/${DISCORD_APPLICATION_ID}/commands`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bot ${DISCORD_BOT_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(commands),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to register Discord commands: ${errorText}`);
  }

  return response.json();
}
