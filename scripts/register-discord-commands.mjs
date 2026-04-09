import "dotenv/config";

const applicationId = process.env.DISCORD_APPLICATION_ID?.trim();
const botToken = process.env.DISCORD_BOT_TOKEN?.trim();

if (!applicationId || !botToken) {
  console.error(
    "DISCORD_APPLICATION_ID and DISCORD_BOT_TOKEN are required to register commands."
  );
  process.exit(1);
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
  `https://discord.com/api/v10/applications/${applicationId}/commands`,
  {
    method: "PUT",
    headers: {
      Authorization: `Bot ${botToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(commands),
  }
);

if (!response.ok) {
  console.error(await response.text());
  process.exit(1);
}

console.log(await response.json());
