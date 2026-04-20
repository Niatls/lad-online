import { useCallback } from "react";

import {
  createAdminVoiceToken,
  deleteAdminChatMessages,
  deleteAdminChatSession,
  downloadAdminChatSession,
} from "@/components/admin/admin-chat-panel/actions-api";
import type { Message, Session, VoiceEvent, VoiceLiveStats } from "@/components/admin/admin-chat-panel/types";

type UseAdminChatActionsParams = {
  selectedId: number | null;
  selectedSession: Session | null;
  selectedMessageIds: number[];
  creatingVoiceToken: boolean;
  archivingSession: boolean;
  deletingSession: boolean;
  downloadingSession: boolean;
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
  setDownloadingSession: React.Dispatch<React.SetStateAction<boolean>>;
  setDeletingMessages: React.Dispatch<React.SetStateAction<boolean>>;
};

const visitorLabel = (name: string | null | undefined, selectedId: number) =>
  name || `\u043f\u043e\u0441\u0435\u0442\u0438\u0442\u0435\u043b\u044f #${selectedId}`;

export function useAdminChatActions({
  selectedId,
  selectedSession,
  selectedMessageIds,
  creatingVoiceToken,
  archivingSession,
  deletingSession,
  downloadingSession,
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
  setDownloadingSession,
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
      const invite = await createAdminVoiceToken(selectedId);
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

    const name = visitorLabel(selectedSession?.visitorName, selectedId);
    if (!window.confirm(`\u0421\u043a\u0440\u044b\u0442\u044c ${name} \u0438\u0437 \u0430\u043a\u0442\u0438\u0432\u043d\u044b\u0445 \u0434\u0438\u0430\u043b\u043e\u0433\u043e\u0432, \u043d\u043e \u0441\u043e\u0445\u0440\u0430\u043d\u0438\u0442\u044c \u0432\u0441\u044e \u0438\u0441\u0442\u043e\u0440\u0438\u044e?`)) {
      return;
    }

    setArchivingSession(true);
    try {
      await deleteAdminChatSession(selectedId, "soft");
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

    const name = visitorLabel(selectedSession?.visitorName, selectedId);
    if (!window.confirm(`\u0423\u0434\u0430\u043b\u0438\u0442\u044c ${name} \u0438 \u0432\u0441\u044e \u0438\u0441\u0442\u043e\u0440\u0438\u044e \u0447\u0430\u0442\u0430?`)) {
      return;
    }

    setDeletingSession(true);
    try {
      await deleteAdminChatSession(selectedId, "hard");
      await resetSelectedSession();
    } catch (err) {
      console.error("Failed to delete session:", err);
    } finally {
      setDeletingSession(false);
    }
  }, [deletingSession, resetSelectedSession, selectedId, selectedSession?.visitorName, setDeletingSession]);

  const handleDownloadSession = useCallback(async () => {
    if (!selectedId || downloadingSession) {
      return;
    }

    setDownloadingSession(true);
    try {
      await downloadAdminChatSession(selectedId);
    } catch (err) {
      console.error("Failed to download session:", err);
    } finally {
      setDownloadingSession(false);
    }
  }, [downloadingSession, selectedId, setDownloadingSession]);

  const handleDeleteMessages = useCallback(async () => {
    if (!selectedId || selectedMessageIds.length === 0 || deletingMessages) {
      return;
    }

    const name = visitorLabel(selectedSession?.visitorName, selectedId);
    if (!window.confirm(`\u0423\u0434\u0430\u043b\u0438\u0442\u044c ${selectedMessageIds.length} \u0441\u043e\u043e\u0431\u0449. \u0438 \u0434\u043b\u044f ${name}?`)) {
      return;
    }

    setDeletingMessages(true);
    try {
      const deletedIds = new Set<number>(await deleteAdminChatMessages(selectedId, selectedMessageIds));
      setMessages((prev) =>
        prev.map((message) =>
          deletedIds.has(message.id)
            ? { ...message, content: "", deletedAt: new Date().toISOString(), deletedBy: "admin", isDeleted: true }
            : message
        )
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
    handleDownloadSession,
    handleDeleteMessages,
  };
}
