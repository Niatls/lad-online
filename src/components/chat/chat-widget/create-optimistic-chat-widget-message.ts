import type { Message } from "@/components/chat/chat-widget/types";

export function createOptimisticChatWidgetMessage(
  tempId: number,
  content: string,
  replyTarget: Message | null
): Message {
  return {
    id: tempId,
    sender: "visitor",
    content,
    replyToId: replyTarget?.id ?? null,
    deletedAt: null,
    deletedBy: null,
    editedAt: null,
    isEdited: false,
    isDeleted: false,
    replyTo: replyTarget
      ? {
          id: replyTarget.id,
          sender: replyTarget.sender,
          content: replyTarget.isDeleted
            ? "Сообщение удалено"
            : replyTarget.content,
          isDeleted: replyTarget.isDeleted,
        }
      : null,
    createdAt: new Date().toISOString(),
  };
}
