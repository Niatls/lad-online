import { createBotApplication } from "@/lib/bot-applications";

import { MODAL_CUSTOM_ID } from "./constants";
import { getStringValue } from "./parsers";
import { createMessageResponse } from "./responses";

export async function handleDiscordModalSubmit(interaction: {
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
      "Не удалось прочитать поля формы. Попробуйте ещё раз."
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
      `Спасибо! Ваш вопрос принят. Код заявки: ${applicationNumber}.`
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
      `Спасибо! Ваша заявка принята. Код заявки: ${applicationNumber}.`
    );
  }

  return createMessageResponse("Неизвестная форма.");
}
