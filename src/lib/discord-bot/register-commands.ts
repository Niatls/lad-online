import { DISCORD_APPLICATION_ID, DISCORD_BOT_TOKEN } from "./config";

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
