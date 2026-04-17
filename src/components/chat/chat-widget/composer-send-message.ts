import {
  createOptimisticChatWidgetMessage,
  editChatWidgetMessage,
  sendChatWidgetMessage,
} from "@/components/chat/chat-widget/composer-message-api";
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
    setSending(true);
    try {
      const updated = await editChatWidgetMessage(sessionId, editingMessageId, text);
      setMessages((prev) => prev.map((message) => (message.id === editingMessageId ? updated : message)));
      setEditingMessageId(null);
      setInput("");
    } catch (err) {
      console.error("Failed to edit:", err);
      setError("РќРµ СѓРґР°Р»РѕСЃСЊ СЃРѕС…СЂР°РЅРёС‚СЊ РёР·РјРµРЅРµРЅРёСЏ.");
    } finally {
      setSending(false);
    }
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
    setError("РќРµ СѓРґР°Р»РѕСЃСЊ РѕС‚РїСЂР°РІРёС‚СЊ СЃРѕРѕР±С‰РµРЅРёРµ.");
    setMessages((prev) => prev.filter((message) => message.id !== tempId));
    setInput(text);
    setReplyTarget(currentReplyTarget);
  } finally {
    setSending(false);
  }
}
