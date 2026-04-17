import { ChatWidgetMessageActions } from "@/components/chat/chat-widget/message-actions";
import { ChatWidgetMessageBody } from "@/components/chat/chat-widget/message-body";
import { resolveChatWidgetMessageState } from "@/components/chat/chat-widget/resolve-chat-widget-message-state";
import type { Message } from "@/components/chat/chat-widget/types";

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
  const { canEdit, isSystem, isVisitor, voiceToken } = resolveChatWidgetMessageState(message);
  if (voiceToken) {
    return null;
  }

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
      <ChatWidgetMessageBody
        isSystem={isSystem}
        isVisitor={isVisitor}
        message={message}
        onJumpToMessage={onJumpToMessage}
      />
      {!isSystem ? (
        <ChatWidgetMessageActions
          canEdit={canEdit}
          message={message}
          onReply={onReply}
          onEdit={onEdit}
        />
      ) : null}
    </div>
  );
}
