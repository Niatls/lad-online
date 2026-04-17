import { useCallback, useEffect } from "react";

import { fetchChatWidgetMessages } from "@/components/chat/chat-widget/session-data-api";
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
    if (!sessionId || !isOpen) {
      return;
    }

    try {
      const [newMessages] = await Promise.all([
        fetchChatWidgetMessages(sessionId, lastMsgIdRef.current),
        syncVoiceInvite(sessionId),
      ]);
      if (newMessages.length === 0) {
        return;
      }

      setMessages((prev) => {
        const existingIds = new Set(prev.map((message) => message.id));
        const uniqueNew = newMessages.filter((message) => !existingIds.has(message.id));
        if (uniqueNew.length === 0) {
          return prev;
        }

        return [...prev, ...uniqueNew];
      });
      lastMsgIdRef.current = newMessages[newMessages.length - 1].id;
      if (!isOpen && newMessages.some((message) => message.sender === "admin" || message.sender === "system")) {
        setHasUnread(true);
      }
      scrollToBottom();
    } catch {
      // silent fail on polling
    }
  }, [isOpen, lastMsgIdRef, scrollToBottom, sessionId, setHasUnread, setMessages, syncVoiceInvite]);

  useEffect(() => {
    if (sessionId && isOpen) {
      pollRef.current = setInterval(pollMessages, 3000);
      return () => clearInterval(pollRef.current);
    }
  }, [isOpen, pollMessages, pollRef, sessionId]);
}
