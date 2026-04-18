import { ChatWidgetMessageContent } from "@/components/chat/chat-widget/message-content";
import { ChatWidgetMessageMeta } from "@/components/chat/chat-widget/message-meta";
import { ChatWidgetMessageReplyPreview } from "@/components/chat/chat-widget/message-reply-preview";
import type { Message } from "@/components/chat/chat-widget/types";

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
  return (
    <div
      className={`max-w-[86%] rounded-[0.525rem] px-3.5 py-2 text-sm leading-snug shadow-sm sm:max-w-[85%] sm:rounded-[0.6rem] sm:px-5 sm:py-3.5 sm:leading-relaxed ${
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

      <ChatWidgetMessageContent
        isSystem={isSystem}
        isVisitor={isVisitor}
        message={message}
      />

      <ChatWidgetMessageMeta
        isSystem={isSystem}
        isVisitor={isVisitor}
        message={message}
      />
    </div>
  );
}
