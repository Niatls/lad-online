import { useCallback, useEffect } from "react";

import { pollChatWidgetMessages } from "@/components/chat/chat-widget/poll-chat-widget-messages";
import type { Message } from "@/components/chat/chat-widget/types";

type UseChatWidgetMessagePollingParams = {
  isOpen: boolean;
  sessionId: number | null;
  scrollToBottom: () => void;
  lastMsgIdRef: React.MutableRefObject<number>;
  pollRef: React.MutableRefObject<ReturnType<typeof setInterval> | undefined>;
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  setHasUnread: React.Dispatch<React.SetStateAction<boolean>>;
  syncVoiceInvite: (sessionId: number) => Promise<void>;
};

export function useChatWidgetMessagePolling({
  isOpen,
  sessionId,
  scrollToBottom,
  lastMsgIdRef,
  pollRef,
  setMessages,
  setHasUnread,
  syncVoiceInvite,
}: UseChatWidgetMessagePollingParams) {
  const pollMessages = useCallback(async () => {
    await pollChatWidgetMessages({
      isOpen,
      sessionId,
      scrollToBottom,
      lastMsgIdRef,
      setMessages,
      setHasUnread,
      syncVoiceInvite,
    });
  }, [isOpen, lastMsgIdRef, scrollToBottom, sessionId, setHasUnread, setMessages, syncVoiceInvite]);

  useEffect(() => {
    if (sessionId && isOpen) {
      pollRef.current = setInterval(pollMessages, 3000);
      return () => clearInterval(pollRef.current);
    }
  }, [isOpen, pollMessages, pollRef, sessionId]);
}
