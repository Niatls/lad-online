import {
  createOptimisticChatWidgetMessage,
  sendChatWidgetMessage,
} from "@/components/chat/chat-widget/composer-message-api";
import type { Message } from "@/components/chat/chat-widget/types";

type SendChatWidgetComposerVisitorMessageParams = {
  text: string;
  lastMsgIdRef: React.MutableRefObject<number>;
  replyTarget: Message | null;
  sessionId: number;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
  setInput: React.Dispatch<React.SetStateAction<string>>;
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  setReplyTarget: React.Dispatch<React.SetStateAction<Message | null>>;
  setSending: React.Dispatch<React.SetStateAction<boolean>>;
};

export async function sendChatWidgetComposerVisitorMessage({
  text,
  lastMsgIdRef,
  replyTarget,
  sessionId,
  setError,
  setInput,
  setMessages,
  setReplyTarget,
  setSending,
}: SendChatWidgetComposerVisitorMessageParams) {
  const currentReplyTarget = replyTarget;
  setInput("");
  setSending(true);

  const tempId = Date.now();
  const optimistic = createOptimisticChatWidgetMessage(tempId, text, currentReplyTarget);
  setMessages((prev) => [...prev, optimistic]);
  setReplyTarget(null);

  try {
    const message = await sendChatWidgetMessage({
      content: text,
      replyToId: optimistic.replyToId,
      sessionId,
    });
    setMessages((prev) => prev.map((current) => (current.id === tempId ? message : current)));
    lastMsgIdRef.current = Math.max(lastMsgIdRef.current, message.id);
  } catch (err) {
    console.error("Failed to send:", err);
    setError("Не удалось отправить сообщение. Проверьте соединение и попробуйте ещё раз.");
    setMessages((prev) => prev.filter((message) => message.id !== tempId));
    setInput(text);
    setReplyTarget(currentReplyTarget);
  } finally {
    setSending(false);
  }
}
