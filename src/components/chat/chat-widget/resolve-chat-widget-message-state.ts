import type { Message } from "@/components/chat/chat-widget/types";
import { parseVoiceInviteToken, parseVoiceMessageContent } from "@/lib/chat-message-format";

export function resolveChatWidgetMessageState(message: Message) {
  const isVisitor = message.sender === "visitor";
  const isSystem = message.sender === "system";
  const voiceToken = parseVoiceInviteToken(message.content);
  const voiceMessage = parseVoiceMessageContent(message.content);
  const canEdit = isVisitor && !isSystem && !message.isDeleted && !voiceMessage;

  return {
    canEdit,
    isSystem,
    isVisitor,
    voiceMessage,
    voiceToken,
  };
}
