import { ChatWidgetMessageMeta } from "@/components/chat/chat-widget/message-meta";
import { ChatWidgetMessageReplyPreview } from "@/components/chat/chat-widget/message-reply-preview";
import { resolveChatWidgetMessageState } from "@/components/chat/chat-widget/resolve-chat-widget-message-state";
import type { Message } from "@/components/chat/chat-widget/types";
import { VoiceMessagePlayer } from "@/components/chat/voice-message-player";

type ChatWidgetMessageBodyProps = {
  isSystem: boolean;
  isVisitor: boolean;
  message: Message;
  onJumpToMessage: (messageId: number) => void;
};

export function ChatWidgetMessageBody({
  isSystem,
  isVisitor,
  message,
  onJumpToMessage,
}: ChatWidgetMessageBodyProps) {
  const { voiceMessage } = resolveChatWidgetMessageState(message);

  return (
    <div
      className={`max-w-[85%] rounded-[1.5rem] px-5 py-3.5 text-sm leading-relaxed shadow-sm ${
        isSystem
          ? "border border-sage-light/20 bg-cream text-forest"
          : isVisitor
            ? "rounded-br-none bg-forest text-white"
            : "rounded-bl-none border border-sage-light/20 bg-white text-forest"
      }`}
    >
      {message.replyTo ? (
        <ChatWidgetMessageReplyPreview
          isSystem={isSystem}
          isVisitor={isVisitor}
          replyTo={message.replyTo}
          onJumpToMessage={onJumpToMessage}
        />
      ) : null}
      {message.isDeleted ? (
        <p className="italic opacity-70">Р В Р’В Р вЂ™Р’В Р В Р’В Р В РІР‚в„–Р В Р’В Р вЂ™Р’В Р В Р Р‹Р Р†Р вЂљРЎС›Р В Р’В Р вЂ™Р’В Р В Р Р‹Р Р†Р вЂљРЎС›Р В Р’В Р вЂ™Р’В Р В РІР‚в„ўР вЂ™Р’В±Р В Р’В Р В Р вЂ№Р В Р вЂ Р В РІР‚С™Р вЂ™Р’В°Р В Р’В Р вЂ™Р’В Р В РІР‚в„ўР вЂ™Р’ВµР В Р’В Р вЂ™Р’В Р В Р’В Р Р†Р вЂљР’В¦Р В Р’В Р вЂ™Р’В Р В Р Р‹Р С–РІР‚С™Р’ВР В Р’В Р вЂ™Р’В Р В РІР‚в„ўР вЂ™Р’Вµ Р ՌЋՌЎвЂњՌ Վ ՌўвЂՌ Վ Ռ’В°Ռ Վ Ռ’В»Ռ Վ Ռ’ВµՌ Վ Ռ вЂ¦Ռ Վ ՌЎвЂў</p>
      ) : voiceMessage ? (
        <VoiceMessagePlayer payload={voiceMessage} tone={isSystem ? "system" : isVisitor ? "visitor" : "admin"} />
      ) : (
        <p>{message.content}</p>
      )}

      <ChatWidgetMessageMeta
        isSystem={isSystem}
        isVisitor={isVisitor}
        message={message}
      />
    </div>
  );
}
