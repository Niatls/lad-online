import { useCallback, useEffect } from "react";

import {
  createChatWidgetSession,
  fetchChatWidgetVoiceInvite,
} from "@/components/chat/chat-widget/session-data-api";
import { useChatWidgetMessagePolling } from "@/components/chat/chat-widget/use-chat-widget-message-polling";
import type { Message, VoiceInvite } from "@/components/chat/chat-widget/types";
import { getStoredVisitorName, getVisitorId, getVoiceSessionStorageKey } from "@/components/chat/chat-widget/utils";

type UseChatWidgetSessionDataParams = {
  isOpen: boolean;
  visitorName: string;
  activeVoiceToken: string | null;
  availableVoiceInvite: VoiceInvite | null;
  voiceCountdownNow: number;
  sessionId: number | null;
  scrollToBottom: () => void;
  setVisitorName: React.Dispatch<React.SetStateAction<string>>;
  setPendingVisitorName: React.Dispatch<React.SetStateAction<string>>;
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  setSessionId: React.Dispatch<React.SetStateAction<number | null>>;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setHasUnread: React.Dispatch<React.SetStateAction<boolean>>;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
  setAvailableVoiceInvite: React.Dispatch<React.SetStateAction<VoiceInvite | null>>;
  setActiveVoiceToken: React.Dispatch<React.SetStateAction<string | null>>;
  setVoiceCountdownNow: React.Dispatch<React.SetStateAction<number>>;
  lastMsgIdRef: React.MutableRefObject<number>;
  pollRef: React.MutableRefObject<ReturnType<typeof setInterval> | undefined>;
};

const CHAT_CONNECT_ERROR = "РќРµ СѓРґР°Р»РѕСЃСЊ РїРѕРґРєР»СЋС‡РёС‚СЊСЃСЏ Рє С‡Р°С‚Сѓ. РџРѕР¶Р°Р»СѓР№СЃС‚Р°, РїРѕРїСЂРѕР±СѓР№С‚Рµ РїРѕР·Р¶Рµ.";
const CHAT_NETWORK_ERROR = "РћС€РёР±РєР° СЃРµС‚Рё. РџСЂРѕРІРµСЂСЊС‚Рµ СЃРѕРµРґРёРЅРµРЅРёРµ.";

export function useChatWidgetSessionData({
  isOpen,
  visitorName,
  activeVoiceToken,
  availableVoiceInvite,
  voiceCountdownNow,
  sessionId,
  scrollToBottom,
  setVisitorName,
  setPendingVisitorName,
  setMessages,
  setSessionId,
  setLoading,
  setHasUnread,
  setError,
  setAvailableVoiceInvite,
  setActiveVoiceToken,
  setVoiceCountdownNow,
  lastMsgIdRef,
  pollRef,
}: UseChatWidgetSessionDataParams) {
  const syncVoiceInvite = useCallback(async (currentSessionId: number) => {
    try {
      const invite = await fetchChatWidgetVoiceInvite(currentSessionId);
      if (!invite || !["pending", "active"].includes(invite.status)) {
        setAvailableVoiceInvite(null);
        if (activeVoiceToken && invite?.token === activeVoiceToken) {
          setActiveVoiceToken(null);
        }
        return;
      }

      setAvailableVoiceInvite(invite);
    } catch {
      // keep current UI state on transient failures
    }
  }, [activeVoiceToken, setActiveVoiceToken, setAvailableVoiceInvite]);

  useEffect(() => {
    const storedName = getStoredVisitorName();
    setVisitorName(storedName);
    setPendingVisitorName(storedName);
  }, [setPendingVisitorName, setVisitorName]);

  useEffect(() => {
    if (typeof window === "undefined" || !sessionId) {
      return;
    }

    const storageKey = getVoiceSessionStorageKey(sessionId);
    if (activeVoiceToken) {
      sessionStorage.setItem(storageKey, activeVoiceToken);
      return;
    }

    sessionStorage.removeItem(storageKey);
  }, [activeVoiceToken, sessionId]);

  const initSession = useCallback(async (nameOverride?: string) => {
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

  useEffect(() => {
    if (!availableVoiceInvite) {
      return;
    }

    setVoiceCountdownNow(Date.now());
    const interval = setInterval(() => {
      setVoiceCountdownNow(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, [availableVoiceInvite, setVoiceCountdownNow]);

  useEffect(() => {
    if (!availableVoiceInvite) {
      return;
    }

    if (new Date(availableVoiceInvite.expiresAt).getTime() <= voiceCountdownNow) {
      setAvailableVoiceInvite(null);
      if (activeVoiceToken === availableVoiceInvite.token) {
        setActiveVoiceToken(null);
      }
    }
  }, [activeVoiceToken, availableVoiceInvite, setActiveVoiceToken, setAvailableVoiceInvite, voiceCountdownNow]);

  useEffect(() => {
    if (!sessionId || !isOpen || activeVoiceToken || !availableVoiceInvite) {
      return;
    }

    const interval = setInterval(() => {
      void syncVoiceInvite(sessionId);
    }, 1000);

    return () => clearInterval(interval);
  }, [activeVoiceToken, availableVoiceInvite, isOpen, sessionId, syncVoiceInvite]);

  useEffect(() => {
    if (typeof window === "undefined" || !sessionId || activeVoiceToken) {
      return;
    }

    const storedToken = sessionStorage.getItem(getVoiceSessionStorageKey(sessionId));
    if (!storedToken) {
      return;
    }

    setActiveVoiceToken(storedToken);
  }, [activeVoiceToken, sessionId, setActiveVoiceToken]);

  const handleOpen = useCallback(() => {
    setHasUnread(false);
    if (!sessionId && visitorName.trim()) {
      void initSession(visitorName);
    }
  }, [initSession, sessionId, setHasUnread, visitorName]);

  return {
    syncVoiceInvite,
    initSession,
    handleOpen,
  };
}
