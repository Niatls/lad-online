import { resolveChatWidgetMessageState } from "@/components/chat/chat-widget/resolve-chat-widget-message-state";
import type { Message } from "@/components/chat/chat-widget/types";
import { VoiceMessagePlayer } from "@/components/chat/voice-message-player";

type ChatWidgetMessageContentProps = {
  isSystem: boolean;
  isVisitor: boolean;
  message: Message;
};

export function ChatWidgetMessageContent({
  isSystem,
  isVisitor,
  message,
}: ChatWidgetMessageContentProps) {
  const { voiceMessage } = resolveChatWidgetMessageState(message);

  if (message.isDeleted) {
    return <p className="italic opacity-70">Сообщение удалено</p>;
  }

  if (voiceMessage) {
    return (
      <VoiceMessagePlayer
        payload={voiceMessage}
        tone={isSystem ? "system" : isVisitor ? "visitor" : "admin"}
      />
    );
  }

  return (
    <p className="pr-[1ch] leading-snug sm:leading-relaxed">
      {message.content}
    </p>
  );
}
