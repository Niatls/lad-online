import { useChatWidgetMessagePolling } from "@/components/chat/chat-widget/use-chat-widget-message-polling";
import type { Message } from "@/components/chat/chat-widget/types";

type UseChatWidgetSessionMessagePollingParams = {
  isOpen: boolean;
  sessionId: number | null;
  scrollToBottom: () => void;
  lastMsgIdRef: React.MutableRefObject<number>;
  pollRef: React.MutableRefObject<ReturnType<typeof setInterval> | undefined>;
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  setHasUnread: React.Dispatch<React.SetStateAction<boolean>>;
  syncVoiceInvite: (sessionId: number) => Promise<void>;
};

export function useChatWidgetSessionMessagePolling({
  isOpen,
  sessionId,
  scrollToBottom,
  lastMsgIdRef,
  pollRef,
  setMessages,
  setHasUnread,
  syncVoiceInvite,
}: UseChatWidgetSessionMessagePollingParams) {
  useChatWidgetMessagePolling({
    isOpen,
    sessionId,
    scrollToBottom,
    lastMsgIdRef,
    pollRef,
    setMessages,
    setHasUnread,
    syncVoiceInvite,
  });
}
