import { CornerUpLeft, Pencil } from "lucide-react";

import type { Message } from "@/components/chat/chat-widget/types";
import { VoiceMessagePlayer } from "@/components/chat/voice-message-player";
import { getChatMessagePreviewText, parseVoiceInviteToken, parseVoiceMessageContent } from "@/lib/chat-message-format";

type ChatWidgetMessageItemProps = {
  message: Message;
  onJumpToMessage: (messageId: number) => void;
  onReply: (message: Message) => void;
  onEdit: (message: Message) => void;
  setMessageRef: (messageId: number, node: HTMLDivElement | null) => void;
};

export function ChatWidgetMessageItem({
  message,
  onJumpToMessage,
  onReply,
  onEdit,
  setMessageRef,
}: ChatWidgetMessageItemProps) {
  const voiceToken = parseVoiceInviteToken(message.content);
  if (voiceToken) {
    return null;
  }

  const isVisitor = message.sender === "visitor";
  const isSystem = message.sender === "system";
  const voiceMessage = parseVoiceMessageContent(message.content);
  const canEdit = isVisitor && !isSystem && !message.isDeleted && !voiceMessage;

  return (
    <div
      key={message.id}
      ref={(node) => {
        setMessageRef(message.id, node);
      }}
      className={`flex animate-in fade-in slide-in-from-bottom-2 duration-300 ${
        isSystem ? "justify-center" : isVisitor ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`max-w-[85%] rounded-[1.5rem] px-5 py-3.5 text-sm leading-relaxed shadow-sm ${
          isSystem
            ? "bg-cream text-forest border border-sage-light/20"
            : isVisitor
              ? "bg-forest text-white rounded-br-none"
              : "bg-white text-forest border border-sage-light/20 rounded-bl-none"
        }`}
      >
        {message.replyTo ? (
          <button
            type="button"
            onClick={() => onJumpToMessage(message.replyTo!.id)}
            className={`mb-2 w-full rounded-2xl border px-3 py-2 text-left text-xs transition ${
              isSystem
                ? "border-forest/10 bg-white/60 text-forest/70"
                : isVisitor
                  ? "border-white/10 bg-white/10 text-white/80"
                  : "border-sage-light/20 bg-cream/40 text-forest/60"
            }`}
          >
            <p className="font-bold mb-0.5">
              {message.replyTo.sender === "visitor" ? "Вы" : message.replyTo.sender === "admin" ? "Поддержка" : "Система"}
            </p>
            <p className="truncate">
              {message.replyTo.isDeleted ? "Сообщение удалено" : getChatMessagePreviewText(message.replyTo.content) ?? "Системное сообщение"}
            </p>
          </button>
        ) : null}
        {message.isDeleted ? (
          <p className="italic opacity-70">Сообщение удалено</p>
        ) : voiceMessage ? (
          <VoiceMessagePlayer payload={voiceMessage} tone={isSystem ? "system" : isVisitor ? "visitor" : "admin"} />
        ) : (
          <p>{message.content}</p>
        )}
        <div
          className={`text-[10px] mt-1.5 font-medium ${
            isSystem ? "text-forest/35" : isVisitor ? "text-white/40" : "text-forest/30"
          }`}
        >
          {new Date(message.createdAt).toLocaleTimeString("ru", { hour: "2-digit", minute: "2-digit" })}
          {message.isEdited ? " · изменено" : ""}
        </div>
      </div>
      {!isSystem ? (
        <div className="self-end mb-1 ml-2 mr-2 flex flex-col gap-2">
          {canEdit ? (
            <button
              type="button"
              onClick={() => onEdit(message)}
              className="rounded-full border border-sage-light/20 bg-white/90 p-2 text-forest/45 transition hover:text-forest hover:bg-white"
              aria-label="Редактировать"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => onReply(message)}
            className="rounded-full border border-sage-light/20 bg-white/90 p-2 text-forest/45 transition hover:text-forest hover:bg-white"
            aria-label="Ответить"
          >
            <CornerUpLeft className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : null}
    </div>
  );
}
