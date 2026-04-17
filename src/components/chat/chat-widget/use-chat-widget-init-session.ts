import { useCallback } from "react";

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

const CHAT_CONNECT_ERROR = "Р СњР Вµ РЎС“Р Т‘Р В°Р В»Р С•РЎРѓРЎРЉ Р С—Р С•Р Т‘Р С”Р В»РЎР‹РЎвЂЎР С‘РЎвЂљРЎРЉРЎРѓРЎРЏ Р С” РЎвЂЎР В°РЎвЂљРЎС“. Р СџР С•Р В¶Р В°Р В»РЎС“Р в„–РЎРѓРЎвЂљР В°, Р С—Р С•Р С—РЎР‚Р С•Р В±РЎС“Р в„–РЎвЂљР Вµ Р С—Р С•Р В·Р В¶Р Вµ.";
const CHAT_NETWORK_ERROR = "Р С›РЎв‚¬Р С‘Р В±Р С”Р В° РЎРѓР ВµРЎвЂљР С‘. Р СџРЎР‚Р С•Р Р†Р ВµРЎР‚РЎРЉРЎвЂљР Вµ РЎРѓР С•Р ВµР Т‘Р С‘Р Р…Р ВµР Р…Р С‘Р Вµ.";

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
      setSessionId(session.id);
      setMessages(session.messages || []);
      if (session.messages?.length) {
        lastMsgIdRef.current = session.messages[session.messages.length - 1].id;
      }
      void syncVoiceInvite(session.id);
    } catch (err) {
      console.error("Failed to init chat:", err);
      setError(err instanceof Error && err.message === "Failed to create session" ? CHAT_CONNECT_ERROR : CHAT_NETWORK_ERROR);
    } finally {
      setLoading(false);
    }
  }, [lastMsgIdRef, setError, setLoading, setMessages, setSessionId, syncVoiceInvite, visitorName]);
}
