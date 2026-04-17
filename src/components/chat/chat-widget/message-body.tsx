import { ChatWidgetMessageReplyPreview } from "@/components/chat/chat-widget/message-reply-preview";
import type { Message } from "@/components/chat/chat-widget/types";
import { VoiceMessagePlayer } from "@/components/chat/voice-message-player";
import { parseVoiceMessageContent } from "@/lib/chat-message-format";

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
  const voiceMessage = parseVoiceMessageContent(message.content);

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
        <p className="italic opacity-70">Р В Р Р‹Р В РЎвЂўР В РЎвЂўР В Р’В±Р РЋРІР‚В°Р В Р’ВµР В Р вЂ¦Р В РЎвЂР В Р’Вµ РЎС“Р Т‘Р В°Р В»Р ВµР Р…Р С•</p>
      ) : voiceMessage ? (
        <VoiceMessagePlayer payload={voiceMessage} tone={isSystem ? "system" : isVisitor ? "visitor" : "admin"} />
      ) : (
        <p>{message.content}</p>
      )}
      <div
        className={`mt-1.5 text-[10px] font-medium ${
          isSystem ? "text-forest/35" : isVisitor ? "text-white/40" : "text-forest/30"
        }`}
      >
        {new Date(message.createdAt).toLocaleTimeString("ru", { hour: "2-digit", minute: "2-digit" })}
        {message.isEdited ? " Р’В· Р С‘Р В·Р СР ВµР Р…Р ВµР Р…Р С•" : ""}
      </div>
    </div>
  );
}
