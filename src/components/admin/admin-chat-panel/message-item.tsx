import { VoiceMessagePlayer } from "@/components/chat/voice-message-player";
import type { Message } from "@/components/admin/admin-chat-panel/types";
import {
  getChatMessagePreviewText,
  parseVoiceInviteToken,
  parseVoiceMessageContent,
} from "@/lib/chat-message-format";

type AdminChatMessageItemProps = {
  message: Message;
  selectedSessionName: string;
  isSelected: boolean;
  onJumpToMessage: (messageId: number) => void;
  onOpenContextMenu: (message: Message, x: number, y: number) => void;
  onToggleSelection: (messageId: number) => void;
  onEdit: (message: Message) => void;
  onClearLongPress: () => void;
  setLongPressTimeout: (callback: () => void) => void;
  setMessageRef: (messageId: number, node: HTMLDivElement | null) => void;
  formatTime: (date: string) => string;
};

export function AdminChatMessageItem({
  message,
  selectedSessionName,
  isSelected,
  onJumpToMessage,
  onOpenContextMenu,
  onToggleSelection,
  onEdit,
  onClearLongPress,
  setLongPressTimeout,
  setMessageRef,
  formatTime,
}: AdminChatMessageItemProps) {
  const voiceToken = parseVoiceInviteToken(message.content);
  if (voiceToken) {
    return null;
  }

  const isAdmin = message.sender === "admin";
  const isSystem = message.sender === "system";
  const voiceMessage = parseVoiceMessageContent(message.content);
  const canSelect = !isSystem;
  const canEdit = isAdmin && !isSystem && !message.isDeleted && !voiceMessage;

  return (
    <div
      key={message.id}
      ref={(node) => {
        setMessageRef(message.id, node);
      }}
      className={`flex animate-in fade-in slide-in-from-bottom-2 duration-300 ${
        isSystem ? "justify-center" : isAdmin ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`flex max-w-[70%] flex-col ${
          isSystem ? "items-center" : isAdmin ? "items-end" : "items-start"
        }`}
      >
        <div
          onContextMenu={(event) => {
            if (!canSelect) {
              return;
            }
            event.preventDefault();
            onOpenContextMenu(message, event.clientX, event.clientY);
          }}
          onMouseDown={(event) => {
            if (event.button !== 0 || !canSelect) {
              return;
            }
            onClearLongPress();
            setLongPressTimeout(() => {
              onToggleSelection(message.id);
            });
          }}
          onMouseLeave={onClearLongPress}
          onMouseUp={onClearLongPress}
          className={`rounded-[1.75rem] px-5 py-4 text-sm leading-relaxed shadow-sm transition-all hover:shadow-md ${
            isSystem
              ? "border border-sage-light/20 bg-cream text-forest"
              : isAdmin
                ? isSelected
                  ? "rounded-br-none bg-forest text-white ring-2 ring-sage"
                  : "rounded-br-none bg-forest text-white"
                : isSelected
                  ? "rounded-bl-none border border-sage bg-white text-forest ring-2 ring-sage"
                  : "rounded-bl-none border border-sage-light/20 bg-white text-forest"
          }`}
        >
          {message.replyTo ? (
            <button
              type="button"
              onClick={() => onJumpToMessage(message.replyTo!.id)}
              className={`mb-2 w-full rounded-2xl border px-3 py-2 text-left text-xs transition ${
                isSystem
                  ? "border-forest/10 bg-white/60 text-forest/70"
                  : isAdmin
                    ? "border-white/10 bg-white/10 text-white/80"
                    : "border-sage-light/20 bg-cream/40 text-forest/60"
              }`}
            >
              <p className="mb-0.5 font-bold">
                {message.replyTo.sender === "admin"
                  ? "Вы"
                  : message.replyTo.sender === "visitor"
                    ? selectedSessionName || "Пользователь"
                    : "Система"}
              </p>
              <p className="truncate">
                {message.replyTo.isDeleted
                  ? "Сообщение удалено"
                  : getChatMessagePreviewText(message.replyTo.content) ??
                    "Системное сообщение"}
              </p>
            </button>
          ) : null}
          {message.isDeleted ? (
            <p className="italic opacity-70">Сообщение удалено</p>
          ) : voiceMessage ? (
            <VoiceMessagePlayer
              payload={voiceMessage}
              tone={isAdmin ? "visitor" : "admin"}
            />
          ) : (
            <p>{message.content}</p>
          )}
        </div>
        <div
          className={`mt-2 flex items-center gap-2 ${
            isAdmin ? "flex-row-reverse" : "flex-row"
          }`}
        >
          <span className="text-[10px] font-bold uppercase tracking-tighter text-forest/20">
            {formatTime(message.createdAt)}
            {message.isEdited ? " · изменено" : ""}
          </span>
          {canEdit ? (
            <button
              type="button"
              onClick={() => onEdit(message)}
              className="rounded-full border border-sage-light/20 bg-white px-2 py-1 text-[10px] font-bold text-forest/45 transition hover:text-forest"
            >
              Ред.
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
