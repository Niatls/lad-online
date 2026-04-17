import type { Message } from "@/components/chat/chat-widget/types";
import { ChatWidgetMessageItem } from "@/components/chat/chat-widget/message-item";

type ChatWidgetMessageListProps = {
  messages: Message[];
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  onJumpToMessage: (messageId: number) => void;
  onReply: (message: Message) => void;
  onEdit: (message: Message) => void;
  setMessageRef: (messageId: number, node: HTMLDivElement | null) => void;
};

export function ChatWidgetMessageList({
  messages,
  messagesEndRef,
  onJumpToMessage,
  onReply,
  onEdit,
  setMessageRef,
}: ChatWidgetMessageListProps) {
  return (
    <>
      {messages.map((message) => (
        <ChatWidgetMessageItem
          key={message.id}
          message={message}
          onJumpToMessage={onJumpToMessage}
          onReply={onReply}
          onEdit={onEdit}
          setMessageRef={setMessageRef}
        />
      ))}
      <div ref={messagesEndRef} />
    </>
  );
}
