import { useChatWidgetHandleSend } from "@/components/chat/chat-widget/use-chat-widget-handle-send";
import type { Message } from "@/components/chat/chat-widget/types";

type UseChatWidgetComposerHandleSendParams = {
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

export function useChatWidgetComposerHandleSend({
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
}: UseChatWidgetComposerHandleSendParams) {
  return useChatWidgetHandleSend({
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
  });
}
