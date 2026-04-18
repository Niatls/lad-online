import { useCallback } from "react";

import { applyChatWidgetSessionInit } from "@/components/chat/chat-widget/apply-chat-widget-session-init";
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

const CHAT_CONNECT_ERROR = "Р В РЎСљР В Р’Вµ Р РЋРЎвЂњР В РўвЂР В Р’В°Р В Р’В»Р В РЎвЂўР ՌЋՌС“Ռ ՌЋՌР‰ Ռ Վ ՌЎвЂ”Ռ Վ ՌЎвЂўՌ Վ ՌўвЂՌ Վ ՌЎвЂќՌ Վ Ռ’В»Ռ ՌЋՌвЂ№Ռ ՌЋՌІՌ‚ՌЋՌ Վ ՌЎвЂՌ ՌЋՌІՌ‚Ս™Ռ ՌЋՌР‰Ռ ՌЋՌС“Ռ ՌЋՌՐџ Ռ Վ ՌЎвЂќ Ռ ՌЋՌІՌ‚ՌЋՌ Վ Ռ’В°Ռ ՌЋՌІՌ‚Ս™Ռ ՌЋՌЎвЂњ. Ռ Վ ՌЎСџՌ Վ ՌЎвЂўՌ Վ Ռ’В¶Ռ Վ Ռ’В°Ռ Վ Ռ’В»Ռ ՌЋՌЎвЂњՌ Վ ՌІвЂћвЂ“Ռ ՌЋՌС“Ռ ՌЋՌІՌ‚Ս™Ռ Վ Ռ’В°, Ռ Վ ՌЎвЂ”Ռ Վ ՌЎвЂўՌ Վ ՌЎвЂ”Ռ ՌЋՌвЂљՌ Վ ՌЎвЂўՌ Վ Ռ’В±Ռ ՌЋՌЎвЂњՌ Վ ՌІвЂћвЂ“Ռ ՌЋՌІՌ‚Ս™Ռ Վ Ռ’Вµ Ռ Վ ՌЎвЂ”Ռ Վ ՌЎвЂўՌ Վ Ռ’В·Ռ Վ Ռ’В¶Ռ Վ Ռ’Вµ.";
const CHAT_NETWORK_ERROR = "Р Վ ՌЎвЂєՌ ՌЋՌІвЂљՎ¬Ռ Վ ՌЎвЂՌ Վ Ռ’В±Ռ Վ ՌЎвЂќՌ Վ Ռ’В° Ռ ՌЋՌС“Ռ Վ Ռ’ВµՌ ՌЋՌІՌ‚Ս™Ռ Վ ՌЎвЂ. Ռ Վ ՌЎСџՌ ՌЋՌвЂљՌ Վ ՌЎвЂўՌ Վ Ռ вЂ Ռ Վ Ռ’ВµՌ ՌЋՌвЂљՌ ՌЋՌР‰Ռ ՌЋՌІՌ‚Ս™Ռ Վ Ռ’Вµ Ռ ՌЋՌС“Ռ Վ ՌЎвЂўՌ Վ Ռ’ВµՌ Վ ՌўвЂՌ Վ ՌЎвЂՌ Վ Ռ вЂ¦Ռ Վ Ռ’ВµՌ Վ Ռ вЂ¦Ռ Վ ՌЎвЂՌ Վ Ռ’Вµ.";

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
      setError(err instanceof Error && err.message === "Failed to create session" ? CHAT_CONNECT_ERROR : CHAT_NETWORK_ERROR);
    } finally {
      setLoading(false);
    }
  }, [lastMsgIdRef, setError, setLoading, setMessages, setSessionId, syncVoiceInvite, visitorName]);
}
