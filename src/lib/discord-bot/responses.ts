import { INTERACTION_RESPONSE } from "./constants";

export function createTextInput(customId: string, label: string, style: 1 | 2) {
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

export function createModal(
  customId: string,
  title: string,
  fields: Array<ReturnType<typeof createTextInput>>
) {
  return {
    type: INTERACTION_RESPONSE.MODAL,
    data: {
      custom_id: customId,
      title,
      components: fields,
    },
  };
}

export function createMessageResponse(content: string) {
  return {
    type: INTERACTION_RESPONSE.CHANNEL_MESSAGE_WITH_SOURCE,
    data: {
      content,
    },
  };
}
