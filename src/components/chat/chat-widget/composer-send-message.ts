import {
  createOptimisticChatWidgetMessage,
  sendChatWidgetMessage,
} from "@/components/chat/chat-widget/composer-message-api";
import { editChatWidgetComposerMessage } from "@/components/chat/chat-widget/edit-chat-widget-composer-message";
import type { Message } from "@/components/chat/chat-widget/types";

type SendChatWidgetComposerMessageParams = {
  editingMessageId: number | null;
  input: string;
  lastMsgIdRef: React.MutableRefObject<number>;
  replyTarget: Message | null;
  sessionId: number;
  setEditingMessageId: React.Dispatch<React.SetStateAction<number | null>>;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
  setInput: React.Dispatch<React.SetStateAction<string>>;
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  setReplyTarget: React.Dispatch<React.SetStateAction<Message | null>>;
  setSending: React.Dispatch<React.SetStateAction<boolean>>;
};

export async function sendChatWidgetComposerMessage({
  editingMessageId,
  input,
  lastMsgIdRef,
  replyTarget,
  sessionId,
  setEditingMessageId,
  setError,
  setInput,
  setMessages,
  setReplyTarget,
  setSending,
}: SendChatWidgetComposerMessageParams) {
  setError((prev) => (prev ? null : prev));

  const text = input.trim();
  if (editingMessageId) {
    await editChatWidgetComposerMessage({
      editingMessageId,
      sessionId,
      text,
      setEditingMessageId,
      setError,
      setInput,
      setMessages,
      setSending,
    });
    return;
  }

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
    setError("Р СњР Вµ РЎС“Р Т‘Р В°Р В»Р С•РЎРѓРЎРЉ Р С•РЎвЂљР С—РЎР‚Р В°Р Р†Р С‘РЎвЂљРЎРЉ РЎРѓР С•Р С•Р В±РЎвЂ°Р ВµР Р…Р С‘Р Вµ.");
    setMessages((prev) => prev.filter((message) => message.id !== tempId));
    setInput(text);
    setReplyTarget(currentReplyTarget);
  } finally {
    setSending(false);
  }
}
