import { useCallback, useEffect } from "react";

import { getAdminVoiceSessionStorageKey } from "@/components/admin/admin-chat-panel/utils";
import type { Message, Session, UsageSummary, VoiceEvent, VoiceInvite } from "@/components/admin/admin-chat-panel/types";

type UseAdminChatSessionDataParams = {
  selectedId: number | null;
  activeVoiceToken: string | null;
  scrollToBottom: () => void;
  setSessions: React.Dispatch<React.SetStateAction<Session[]>>;
  setUsage: React.Dispatch<React.SetStateAction<UsageSummary>>;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  setSelectedMessageIds: React.Dispatch<React.SetStateAction<number[]>>;
  setReplyTarget: React.Dispatch<React.SetStateAction<Message | null>>;
  setEditingMessageId: React.Dispatch<React.SetStateAction<number | null>>;
  setVoiceEvents: React.Dispatch<React.SetStateAction<VoiceEvent[]>>;
  setActiveVoiceToken: React.Dispatch<React.SetStateAction<string | null>>;
  lastMsgIdRef: React.MutableRefObject<number>;
  pollRef: React.MutableRefObject<ReturnType<typeof setInterval> | undefined>;
};

export function useAdminChatSessionData({
  selectedId,
  activeVoiceToken,
  scrollToBottom,
  setSessions,
  setUsage,
  setLoading,
  setMessages,
  setSelectedMessageIds,
  setReplyTarget,
  setEditingMessageId,
  setVoiceEvents,
  setActiveVoiceToken,
  lastMsgIdRef,
  pollRef,
}: UseAdminChatSessionDataParams) {
  const loadSessions = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/chat/sessions");
      if (res.ok) {
        const data = await res.json();
        setSessions(data.sessions ?? []);
        if (data.usage) {
          setUsage(data.usage);
        }
      }
    } catch (err) {
      console.error("Failed to load sessions:", err);
    } finally {
      setLoading(false);
    }
  }, [setLoading, setSessions, setUsage]);

  useEffect(() => {
    void loadSessions();
    const interval = setInterval(() => {
      void loadSessions();
    }, 5000);
    return () => clearInterval(interval);
  }, [loadSessions]);

  const loadMessages = useCallback(async (sessionId: number) => {
    try {
      const res = await fetch(`/api/chat/sessions/${sessionId}/messages?after=0`);
      if (res.ok) {
        const msgs = await res.json();
        setMessages(msgs);
        setSelectedMessageIds([]);
        setReplyTarget(null);
        setEditingMessageId(null);
        if (msgs.length) {
          lastMsgIdRef.current = msgs[msgs.length - 1].id;
        }
      }
    } catch (err) {
      console.error("Failed to load messages:", err);
    }
  }, [lastMsgIdRef, setEditingMessageId, setMessages, setReplyTarget, setSelectedMessageIds]);

  const loadVoiceEvents = useCallback(async (sessionId: number) => {
    try {
      const res = await fetch(`/api/admin/chat/sessions/${sessionId}/voice-events?limit=12`, {
        cache: "no-store",
      });
      if (!res.ok) {
        return;
      }

      const data = await res.json();
      setVoiceEvents(data.events ?? []);
    } catch (err) {
      console.error("Failed to load voice events:", err);
    }
  }, [setVoiceEvents]);

  const syncAdminVoiceInvite = useCallback(async (sessionId: number) => {
    try {
      const res = await fetch(`/api/chat/sessions/${sessionId}/voice`, { cache: "no-store" });
      if (!res.ok) {
        if ([404, 410].includes(res.status) && activeVoiceToken) {
          setActiveVoiceToken(null);
        }
        return null;
      }

      const data = await res.json();
      const invite = data?.invite as VoiceInvite | null;
      if (!invite || !["pending", "active"].includes(invite.status)) {
        if (activeVoiceToken) {
          setActiveVoiceToken(null);
        }
        return null;
      }

      if (!activeVoiceToken || activeVoiceToken !== invite.token) {
        setActiveVoiceToken(invite.token);
      }

      return invite;
    } catch (err) {
      console.error("Failed to sync admin voice invite:", err);
      return null;
    }
  }, [activeVoiceToken, setActiveVoiceToken]);

  const pollMessages = useCallback(async () => {
    if (!selectedId) {
      return;
    }

    try {
      const [res] = await Promise.all([
        fetch(`/api/chat/sessions/${selectedId}/messages?after=${lastMsgIdRef.current}`),
        syncAdminVoiceInvite(selectedId),
        loadVoiceEvents(selectedId),
      ]);

      if (res.ok) {
        const newMsgs: Message[] = await res.json();
        if (newMsgs.length > 0) {
          setMessages((prev) => [...prev, ...newMsgs]);
          lastMsgIdRef.current = newMsgs[newMsgs.length - 1].id;
          scrollToBottom();
        }
      }
    } catch {
      // silent
    }
  }, [lastMsgIdRef, loadVoiceEvents, scrollToBottom, selectedId, setMessages, syncAdminVoiceInvite]);

  useEffect(() => {
    if (!selectedId) {
      return;
    }

    lastMsgIdRef.current = 0;
    void loadMessages(selectedId);
    void syncAdminVoiceInvite(selectedId);
    void loadVoiceEvents(selectedId);
    pollRef.current = setInterval(() => {
      void pollMessages();
    }, 2000);

    return () => clearInterval(pollRef.current);
  }, [lastMsgIdRef, loadMessages, loadVoiceEvents, pollMessages, pollRef, selectedId, syncAdminVoiceInvite]);

  useEffect(() => {
    if (typeof window === "undefined" || !selectedId) {
      return;
    }

    const storageKey = getAdminVoiceSessionStorageKey(selectedId);
    if (activeVoiceToken) {
      sessionStorage.setItem(storageKey, activeVoiceToken);
      return;
    }

    sessionStorage.removeItem(storageKey);
  }, [activeVoiceToken, selectedId]);

  useEffect(() => {
    if (typeof window === "undefined" || !selectedId || activeVoiceToken) {
      return;
    }

    const storedToken = sessionStorage.getItem(getAdminVoiceSessionStorageKey(selectedId));
    if (!storedToken) {
      return;
    }

    setActiveVoiceToken(storedToken);
  }, [activeVoiceToken, selectedId, setActiveVoiceToken]);

  return {
    loadSessions,
    loadMessages,
    loadVoiceEvents,
    syncAdminVoiceInvite,
  };
}
