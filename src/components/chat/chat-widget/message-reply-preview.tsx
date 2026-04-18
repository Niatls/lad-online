import { getChatMessagePreviewText } from "@/lib/chat-message-format";

import type { Message } from "@/components/chat/chat-widget/types";

type ChatWidgetMessageReplyPreviewProps = {
  isSystem: boolean;
  isVisitor: boolean;
  replyTo: NonNullable<Message["replyTo"]>;
  onJumpToMessage: (messageId: number) => void;
};

export function ChatWidgetMessageReplyPreview({
  isSystem,
  isVisitor,
  replyTo,
  onJumpToMessage,
}: ChatWidgetMessageReplyPreviewProps) {
  return (
    <button
      type="button"
      onClick={() => onJumpToMessage(replyTo.id)}
      className={`mb-1.5 w-full rounded-2xl border px-2.5 py-1.5 text-left text-xs leading-snug transition sm:mb-2 sm:px-3 sm:py-2 ${
        isSystem
          ? "border-forest/10 bg-white/60 text-forest/70"
          : isVisitor
            ? "border-white/10 bg-white/10 text-white/80"
            : "border-sage-light/20 bg-cream/40 text-forest/60"
      }`}
    >
      <p className="mb-0.5 font-bold">
        {replyTo.sender === "visitor"
          ? "Вы"
          : replyTo.sender === "admin"
            ? "Поддержка"
            : "Система"}
      </p>
      <p className="truncate">
        {replyTo.isDeleted
          ? "Сообщение удалено"
          : getChatMessagePreviewText(replyTo.content) ?? "Системное сообщение"}
      </p>
    </button>
  );
}
