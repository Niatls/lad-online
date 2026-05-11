import { useCallback, useEffect, useRef } from "react";

import { pollChatWidgetMessages } from "@/components/chat/chat-widget/poll-chat-widget-messages";
import type { Message } from "@/components/chat/chat-widget/types";

const ACTIVE_MESSAGE_POLL_MS = 10_000;
const BACKGROUND_MESSAGE_POLL_MS = 60_000;
const VOICE_INVITE_SYNC_MS = 30_000;

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
  const lastVoiceInviteSyncAtRef = useRef(0);

  const pollMessages = useCallback(async () => {
    const now = Date.now();
    const shouldSyncVoiceInvite = now - lastVoiceInviteSyncAtRef.current >= VOICE_INVITE_SYNC_MS;
    if (shouldSyncVoiceInvite) {
      lastVoiceInviteSyncAtRef.current = now;
    }

    await pollChatWidgetMessages({
      isOpen,
      sessionId,
      shouldSyncVoiceInvite,
      scrollToBottom,
      lastMsgIdRef,
      setMessages,
      setHasUnread,
      syncVoiceInvite,
    });
  }, [isOpen, lastMsgIdRef, scrollToBottom, sessionId, setHasUnread, setMessages, syncVoiceInvite]);

  useEffect(() => {
    if (!sessionId || !isOpen) {
      return;
    }

    const getIntervalMs = () =>
      typeof document !== "undefined" && document.visibilityState === "hidden"
        ? BACKGROUND_MESSAGE_POLL_MS
        : ACTIVE_MESSAGE_POLL_MS;

    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    const scheduleNextPoll = () => {
      timeoutId = setTimeout(() => {
        void pollMessages().finally(scheduleNextPoll);
      }, getIntervalMs());
    };

    scheduleNextPoll();

    const handleVisibilityChange = () => {
      if (document.visibilityState !== "visible") {
        return;
      }
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      void pollMessages().finally(scheduleNextPoll);
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (pollRef.current) {
        clearInterval(pollRef.current);
      }
    };
  }, [isOpen, pollMessages, pollRef, sessionId]);
}
