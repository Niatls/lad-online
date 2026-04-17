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
      className={`mb-2 w-full rounded-2xl border px-3 py-2 text-left text-xs transition ${
        isSystem
          ? "border-forest/10 bg-white/60 text-forest/70"
          : isVisitor
            ? "border-white/10 bg-white/10 text-white/80"
            : "border-sage-light/20 bg-cream/40 text-forest/60"
      }`}
    >
      <p className="mb-0.5 font-bold">
        {replyTo.sender === "visitor" ? "Р’С‹" : replyTo.sender === "admin" ? "РџРѕРґРґРµСЂР¶РєР°" : "РЎРёСЃС‚РµРјР°"}
      </p>
      <p className="truncate">
        {replyTo.isDeleted ? "РЎРѕРѕР±С‰РµРЅРёРµ СѓРґР°Р»РµРЅРѕ" : getChatMessagePreviewText(replyTo.content) ?? "РЎРёСЃС‚РµРјРЅРѕРµ СЃРѕРѕР±С‰РµРЅРёРµ"}
      </p>
    </button>
  );
}
