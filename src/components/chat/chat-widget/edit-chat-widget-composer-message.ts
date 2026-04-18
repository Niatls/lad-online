import { editChatWidgetMessage } from "@/components/chat/chat-widget/composer-message-api";
import type { Message } from "@/components/chat/chat-widget/types";

type EditChatWidgetComposerMessageParams = {
  editingMessageId: number;
  sessionId: number;
  text: string;
  setEditingMessageId: React.Dispatch<React.SetStateAction<number | null>>;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
  setInput: React.Dispatch<React.SetStateAction<string>>;
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  setSending: React.Dispatch<React.SetStateAction<boolean>>;
};

export async function editChatWidgetComposerMessage({
  editingMessageId,
  sessionId,
  text,
  setEditingMessageId,
  setError,
  setInput,
  setMessages,
  setSending,
}: EditChatWidgetComposerMessageParams) {
  setSending(true);

  try {
    const updated = await editChatWidgetMessage(sessionId, editingMessageId, text);
    setMessages((prev) => prev.map((message) => (message.id === editingMessageId ? updated : message)));
    setEditingMessageId(null);
    setInput("");
  } catch (err) {
    console.error("Failed to edit:", err);
    setError("Не удалось сохранить изменения.");
  } finally {
    setSending(false);
  }
}
