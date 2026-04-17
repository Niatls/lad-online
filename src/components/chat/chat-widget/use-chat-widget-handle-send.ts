import { useCallback } from "react";

import { sendChatWidgetComposerMessage } from "@/components/chat/chat-widget/composer-send-message";
import type { Message } from "@/components/chat/chat-widget/types";

type UseChatWidgetHandleSendParams = {
  sessionId: number | null;
  input: string;
  sending: boolean;
  editingMessageId: number | null;
  replyTarget: Message | null;
  lastMsgIdRef: React.MutableRefObject<number>;
  setEditingMessageId: React.Dispatch<React.SetStateAction<number | null>>;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
  setInput: React.Dispatch<React.SetStateAction<string>>;
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  setReplyTarget: React.Dispatch<React.SetStateAction<Message | null>>;
  setSending: React.Dispatch<React.SetStateAction<boolean>>;
};

export function useChatWidgetHandleSend({
  sessionId,
  input,
  sending,
  editingMessageId,
  replyTarget,
  lastMsgIdRef,
  setEditingMessageId,
  setError,
  setInput,
  setMessages,
  setReplyTarget,
  setSending,
}: UseChatWidgetHandleSendParams) {
  return useCallback(async () => {
    if (!input.trim() || !sessionId || sending) {
      return;
    }

    await sendChatWidgetComposerMessage({
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
    });
  }, [
    editingMessageId,
    input,
    lastMsgIdRef,
    replyTarget,
    sending,
    sessionId,
    setEditingMessageId,
    setError,
    setInput,
    setMessages,
    setReplyTarget,
    setSending,
  ]);
}
