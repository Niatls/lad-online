import { useCallback } from "react";

import { applyChatWidgetSessionInit } from "@/components/chat/chat-widget/apply-chat-widget-session-init";
import { resolveChatWidgetSessionInitError } from "@/components/chat/chat-widget/resolve-chat-widget-session-init-error";
import { createChatWidgetSession } from "@/components/chat/chat-widget/session-data-api";
import type { Message } from "@/components/chat/chat-widget/types";
import { getVisitorId } from "@/components/chat/chat-widget/utils";

type UseChatWidgetInitSessionParams = {
  visitorName: string;
  lastMsgIdRef: React.MutableRefObject<number>;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  setSessionId: React.Dispatch<React.SetStateAction<number | null>>;
  syncVoiceInvite: (sessionId: number) => Promise<void>;
};

export function useChatWidgetInitSession({
  visitorName,
  lastMsgIdRef,
  setError,
  setLoading,
  setMessages,
  setSessionId,
  syncVoiceInvite,
}: UseChatWidgetInitSessionParams) {
  return useCallback(async (nameOverride?: string) => {
    const resolvedName = (nameOverride ?? visitorName).trim();
    if (!resolvedName) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const visitorId = getVisitorId();
      const session = await createChatWidgetSession({ visitorId, visitorName: resolvedName });

      applyChatWidgetSessionInit({
        lastMsgIdRef,
        session,
        setMessages,
        setSessionId,
        syncVoiceInvite,
      });
    } catch (err) {
      console.error("Failed to init chat:", err);
      setError(resolveChatWidgetSessionInitError(err));
    } finally {
      setLoading(false);
    }
  }, [lastMsgIdRef, setError, setLoading, setMessages, setSessionId, syncVoiceInvite, visitorName]);
}
