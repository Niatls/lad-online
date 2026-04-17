import { useCallback, useEffect } from "react";

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
      const res = await fetch(`/api/chat/sessions/${currentSessionId}/voice`, { cache: "no-store" });
      if (!res.ok) {
        setAvailableVoiceInvite(null);
        return;
      }

      const data = await res.json();
      const invite = data?.invite as VoiceInvite | null;
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
      const res = await fetch("/api/chat/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visitorId, visitorName: resolvedName }),
      });
      if (res.ok) {
        const session = await res.json();
        setSessionId(session.id);
        setMessages(session.messages || []);
        if (session.messages?.length) {
          lastMsgIdRef.current = session.messages[session.messages.length - 1].id;
        }
        void syncVoiceInvite(session.id);
      } else {
        setError("Не удалось подключиться к чату. Пожалуйста, попробуйте позже.");
      }
    } catch (err) {
      console.error("Failed to init chat:", err);
      setError("Ошибка сети. Проверьте соединение.");
    } finally {
      setLoading(false);
    }
  }, [lastMsgIdRef, setError, setLoading, setMessages, setSessionId, syncVoiceInvite, visitorName]);

  const pollMessages = useCallback(async () => {
    if (!sessionId || !isOpen) {
      return;
    }

    try {
      const [messagesRes] = await Promise.all([
        fetch(`/api/chat/sessions/${sessionId}/messages?after=${lastMsgIdRef.current}`),
        syncVoiceInvite(sessionId),
      ]);
      if (messagesRes.ok) {
        const newMessages: Message[] = await messagesRes.json();
        if (newMessages.length > 0) {
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
        }
      }
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
