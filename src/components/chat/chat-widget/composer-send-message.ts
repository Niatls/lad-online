import { editChatWidgetComposerMessage } from "@/components/chat/chat-widget/edit-chat-widget-composer-message";
import { sendChatWidgetComposerVisitorMessage } from "@/components/chat/chat-widget/send-chat-widget-composer-visitor-message";
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

  await sendChatWidgetComposerVisitorMessage({
    text,
    lastMsgIdRef,
    replyTarget,
    sessionId,
    setError,
    setInput,
    setMessages,
    setReplyTarget,
    setSending,
  });
}
