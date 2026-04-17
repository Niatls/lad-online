import type { Message } from "@/components/admin/admin-chat-panel/types";
import { AdminChatMessageItem } from "@/components/admin/admin-chat-panel/message-item";

type AdminChatMessageListProps = {
  messages: Message[];
  selectedSessionName: string;
  selectedMessageIds: number[];
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  onJumpToMessage: (messageId: number) => void;
  onOpenContextMenu: (message: Message, x: number, y: number) => void;
  onToggleSelection: (messageId: number) => void;
  onEditMessage: (message: Message) => void;
  onClearLongPress: () => void;
  setLongPressTimeout: (callback: () => void) => void;
  setMessageRef: (messageId: number, node: HTMLDivElement | null) => void;
  formatTime: (date: string) => string;
};

export function AdminChatMessageList({
  messages,
  selectedSessionName,
  selectedMessageIds,
  messagesEndRef,
  onJumpToMessage,
  onOpenContextMenu,
  onToggleSelection,
  onEditMessage,
  onClearLongPress,
  setLongPressTimeout,
  setMessageRef,
  formatTime,
}: AdminChatMessageListProps) {
  return (
    <div className="flex-1 overflow-y-auto px-8 py-8 space-y-6 bg-cream/10">
      {messages.map((message) => (
        <AdminChatMessageItem
          key={message.id}
          message={message}
          selectedSessionName={selectedSessionName}
          isSelected={selectedMessageIds.includes(message.id)}
          onJumpToMessage={onJumpToMessage}
          onOpenContextMenu={onOpenContextMenu}
          onToggleSelection={onToggleSelection}
          onEdit={onEditMessage}
          onClearLongPress={onClearLongPress}
          setLongPressTimeout={setLongPressTimeout}
          setMessageRef={setMessageRef}
          formatTime={formatTime}
        />
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
}
