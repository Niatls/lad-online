import { INTERACTION_RESPONSE, INTERACTION_TYPE } from "./constants";
import { handleDiscordCommand } from "./commands";
import { handleDiscordModalSubmit } from "./modal-submit";
import { createMessageResponse } from "./responses";

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
