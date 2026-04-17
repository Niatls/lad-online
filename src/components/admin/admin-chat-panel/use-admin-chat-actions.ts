import { useCallback } from "react";

import type { Message, Session, VoiceEvent, VoiceLiveStats } from "@/components/admin/admin-chat-panel/types";

type UseAdminChatActionsParams = {
  selectedId: number | null;
  selectedSession: Session | null;
  selectedMessageIds: number[];
  creatingVoiceToken: boolean;
  archivingSession: boolean;
  deletingSession: boolean;
  deletingMessages: boolean;
  loadMessages: (sessionId: number) => Promise<void>;
  loadSessions: () => Promise<void>;
  loadVoiceEvents: (sessionId: number) => Promise<void>;
  syncAdminVoiceInvite: (sessionId: number) => Promise<unknown>;
  setSelectedId: React.Dispatch<React.SetStateAction<number | null>>;
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  setActiveVoiceToken: React.Dispatch<React.SetStateAction<string | null>>;
  setActiveVoiceStats: React.Dispatch<React.SetStateAction<VoiceLiveStats | null>>;
  setVoiceEvents: React.Dispatch<React.SetStateAction<VoiceEvent[]>>;
  setSelectedMessageIds: React.Dispatch<React.SetStateAction<number[]>>;
  setReplyTarget: React.Dispatch<React.SetStateAction<Message | null>>;
  setEditingMessageId: React.Dispatch<React.SetStateAction<number | null>>;
  setContextMenu: React.Dispatch<React.SetStateAction<{ left: number; top: number; message: Message } | null>>;
  setCreatingVoiceToken: React.Dispatch<React.SetStateAction<boolean>>;
  setArchivingSession: React.Dispatch<React.SetStateAction<boolean>>;
  setDeletingSession: React.Dispatch<React.SetStateAction<boolean>>;
  setDeletingMessages: React.Dispatch<React.SetStateAction<boolean>>;
};

export function useAdminChatActions({
  selectedId,
  selectedSession,
  selectedMessageIds,
  creatingVoiceToken,
  archivingSession,
  deletingSession,
  deletingMessages,
  loadMessages,
  loadSessions,
  loadVoiceEvents,
  syncAdminVoiceInvite,
  setSelectedId,
  setMessages,
  setActiveVoiceToken,
  setActiveVoiceStats,
  setVoiceEvents,
  setSelectedMessageIds,
  setReplyTarget,
  setEditingMessageId,
  setContextMenu,
  setCreatingVoiceToken,
  setArchivingSession,
  setDeletingSession,
  setDeletingMessages,
}: UseAdminChatActionsParams) {
  const resetSelectedSession = useCallback(async () => {
    setSelectedId(null);
    setMessages([]);
    setActiveVoiceToken(null);
    setActiveVoiceStats(null);
    setVoiceEvents([]);
    setSelectedMessageIds([]);
    setReplyTarget(null);
    setEditingMessageId(null);
    setContextMenu(null);
    await loadSessions();
  }, [
    loadSessions,
    setActiveVoiceStats,
    setActiveVoiceToken,
    setContextMenu,
    setEditingMessageId,
    setMessages,
    setReplyTarget,
    setSelectedId,
    setSelectedMessageIds,
    setVoiceEvents,
  ]);

  const handleGenerateVoiceToken = useCallback(async () => {
    if (!selectedId || creatingVoiceToken) {
      return;
    }

    setCreatingVoiceToken(true);
    try {
      const res = await fetch(`/api/admin/chat/sessions/${selectedId}/voice-token`, {
        method: "POST",
      });

      if (!res.ok) {
        throw new Error("Failed to create voice token");
      }

      const invite = await res.json();
      if (invite?.token) {
        setActiveVoiceToken(invite.token);
      }

      await loadMessages(selectedId);
      await loadSessions();
      await syncAdminVoiceInvite(selectedId);
      await loadVoiceEvents(selectedId);
    } catch (err) {
      console.error("Failed to generate voice token:", err);
    } finally {
      setCreatingVoiceToken(false);
    }
  }, [
    creatingVoiceToken,
    loadMessages,
    loadSessions,
    loadVoiceEvents,
    selectedId,
    setActiveVoiceToken,
    setCreatingVoiceToken,
    syncAdminVoiceInvite,
  ]);

  const handleArchiveSession = useCallback(async () => {
    if (!selectedId || archivingSession) {
      return;
    }

    const name = selectedSession?.visitorName || `посетителя #${selectedId}`;
    if (!window.confirm(`Скрыть ${name} из активных диалогов, но сохранить всю историю?`)) {
      return;
    }

    setArchivingSession(true);
    try {
      const res = await fetch(`/api/admin/chat/sessions/${selectedId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "soft" }),
      });
      if (!res.ok) {
        throw new Error("Failed to archive session");
      }

      await resetSelectedSession();
    } catch (err) {
      console.error("Failed to archive session:", err);
    } finally {
      setArchivingSession(false);
    }
  }, [archivingSession, resetSelectedSession, selectedId, selectedSession?.visitorName, setArchivingSession]);

  const handleDeleteSession = useCallback(async () => {
    if (!selectedId || deletingSession) {
      return;
    }

    const name = selectedSession?.visitorName || `посетителя #${selectedId}`;
    if (!window.confirm(`Удалить ${name} и всю историю чата?`)) {
      return;
    }

    setDeletingSession(true);
    try {
      const res = await fetch(`/api/admin/chat/sessions/${selectedId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "hard" }),
      });
      if (!res.ok) {
        throw new Error("Failed to delete session");
      }

      await resetSelectedSession();
    } catch (err) {
      console.error("Failed to delete session:", err);
    } finally {
      setDeletingSession(false);
    }
  }, [deletingSession, resetSelectedSession, selectedId, selectedSession?.visitorName, setDeletingSession]);

  const handleDeleteMessages = useCallback(async () => {
    if (!selectedId || selectedMessageIds.length === 0 || deletingMessages) {
      return;
    }

    const name = selectedSession?.visitorName || `пользователя #${selectedId}`;
    if (!window.confirm(`Удалить ${selectedMessageIds.length} сообщ. и для ${name}?`)) {
      return;
    }

    setDeletingMessages(true);
    try {
      const res = await fetch(`/api/admin/chat/sessions/${selectedId}/messages`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messageIds: selectedMessageIds }),
      });

      if (!res.ok) {
        throw new Error("Failed to delete messages");
      }

      const data = await res.json();
      const deletedIds = new Set<number>(data.deletedIds ?? []);
      setMessages((prev) =>
        prev.map((message) =>
          deletedIds.has(message.id)
            ? { ...message, content: "", deletedAt: new Date().toISOString(), deletedBy: "admin", isDeleted: true }
            : message,
        ),
      );
      setSelectedMessageIds([]);
    } catch (err) {
      console.error("Failed to delete messages:", err);
    } finally {
      setDeletingMessages(false);
    }
  }, [
    deletingMessages,
    selectedId,
    selectedMessageIds,
    selectedSession?.visitorName,
    setDeletingMessages,
    setMessages,
    setSelectedMessageIds,
  ]);

  return {
    handleGenerateVoiceToken,
    handleArchiveSession,
    handleDeleteSession,
    handleDeleteMessages,
  };
}
