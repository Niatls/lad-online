import { CornerUpLeft, Pencil } from "lucide-react";

import { ChatWidgetMessageReplyPreview } from "@/components/chat/chat-widget/message-reply-preview";
import type { Message } from "@/components/chat/chat-widget/types";
import { VoiceMessagePlayer } from "@/components/chat/voice-message-player";
import { parseVoiceInviteToken, parseVoiceMessageContent } from "@/lib/chat-message-format";

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
          <p className="italic opacity-70">РЎРѕРѕР±С‰РµРЅРёРµ СѓРґР°Р»РµРЅРѕ</p>
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
          {message.isEdited ? " В· РёР·РјРµРЅРµРЅРѕ" : ""}
        </div>
      </div>
      {!isSystem ? (
        <div className="mb-1 ml-2 mr-2 flex self-end flex-col gap-2">
          {canEdit ? (
            <button
              type="button"
              onClick={() => onEdit(message)}
              className="rounded-full border border-sage-light/20 bg-white/90 p-2 text-forest/45 transition hover:bg-white hover:text-forest"
              aria-label="Р РµРґР°РєС‚РёСЂРѕРІР°С‚СЊ"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => onReply(message)}
            className="rounded-full border border-sage-light/20 bg-white/90 p-2 text-forest/45 transition hover:bg-white hover:text-forest"
            aria-label="РћС‚РІРµС‚РёС‚СЊ"
          >
            <CornerUpLeft className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : null}
    </div>
  );
}
