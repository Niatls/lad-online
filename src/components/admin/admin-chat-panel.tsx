"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  MessageCircle,
  Send,
  Loader2,
  ArrowLeft,
  User,
  Clock,
  Phone,
  Trash2,
  Archive,
  X,
} from "lucide-react";
import { AdminChatContextMenu } from "@/components/admin/admin-chat-panel/context-menu";
import { AdminChatComposer } from "@/components/admin/admin-chat-panel/composer";
import { AdminChatEmptyState } from "@/components/admin/admin-chat-panel/empty-state";
import { AdminChatMessageList } from "@/components/admin/admin-chat-panel/message-list";
import { AdminChatSessionList } from "@/components/admin/admin-chat-panel/session-list";
import { AdminChatSessionHeader } from "@/components/admin/admin-chat-panel/session-header";
import type {
  Message,
  Session,
  UsageSummary,
  VoiceEvent,
  VoiceLiveStats,
} from "@/components/admin/admin-chat-panel/types";
import { useAdminChatActions } from "@/components/admin/admin-chat-panel/use-admin-chat-actions";
import { useAdminChatComposer } from "@/components/admin/admin-chat-panel/use-admin-chat-composer";
import { useAdminChatSessionData } from "@/components/admin/admin-chat-panel/use-admin-chat-session-data";
import { formatAdminChatTime } from "@/components/admin/admin-chat-panel/utils";
import { AdminVoiceEventsSidebar } from "@/components/admin/admin-chat-panel/voice-events-sidebar";
import { VoiceCallPanel } from "@/components/chat/voice-call-panel";
import { VoiceCallBoundary } from "@/components/chat/voice-call-boundary";
import { getChatMessagePreviewText } from "@/lib/chat-message-format";

export function AdminChatPanel() {
  const panelRef = useRef<HTMLDivElement>(null);
  const contextMenuRef = useRef<HTMLDivElement>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [sendingVoice, setSendingVoice] = useState(false);
  const [recordingStartedAt, setRecordingStartedAt] = useState<number | null>(null);
  const [selectedMessageIds, setSelectedMessageIds] = useState<number[]>([]);
  const [replyTarget, setReplyTarget] = useState<Message | null>(null);
  const [editingMessageId, setEditingMessageId] = useState<number | null>(null);
  const [creatingVoiceToken, setCreatingVoiceToken] = useState(false);
  const [archivingSession, setArchivingSession] = useState(false);
  const [deletingSession, setDeletingSession] = useState(false);
  const [downloadingSession, setDownloadingSession] = useState(false);
  const [deletingMessages, setDeletingMessages] = useState(false);
  const [activeVoiceToken, setActiveVoiceToken] = useState<string | null>(null);
  const [voiceEvents, setVoiceEvents] = useState<VoiceEvent[]>([]);
  const [activeVoiceStats, setActiveVoiceStats] = useState<VoiceLiveStats | null>(null);
  const [usage, setUsage] = useState<UsageSummary>({
    totalBytes: 0,
    inviteCount: 0,
    monthlyCapBytes: 1000 * 1024 * 1024 * 1024,
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageRefs = useRef(new Map<number, HTMLDivElement | null>());
  const longPressRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const recordingStartedAtRef = useRef<number | null>(null);
  const voiceChunksRef = useRef<Blob[]>([]);
  const [contextMenu, setContextMenu] = useState<{
    left: number;
    top: number;
    message: Message;
  } | null>(null);
  const lastMsgIdRef = useRef(0);
  const pollRef = useRef<ReturnType<typeof setInterval>>(undefined);

  const selectedSession = useMemo(
    () => sessions.find((session) => session.id === selectedId) ?? null,
    [selectedId, sessions],
  );
  const displayedUsageBytes = useMemo(
    () => usage.totalBytes + (activeVoiceStats?.liveServerBytes ?? 0),
    [activeVoiceStats?.liveServerBytes, usage.totalBytes],
  );
  const displayedUsagePercent = useMemo(
    () => ((displayedUsageBytes / usage.monthlyCapBytes) * 100 || 0).toFixed(4),
    [displayedUsageBytes, usage.monthlyCapBytes],
  );
  const contextMenuPosition = useMemo(
    () => (contextMenu ? { left: contextMenu.left, top: contextMenu.top } : { left: 0, top: 0 }),
    [contextMenu],
  );

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const { loadSessions, loadMessages, loadVoiceEvents, syncAdminVoiceInvite } = useAdminChatSessionData({
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
  });

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const { handleSend, handleToggleVoiceRecording } = useAdminChatComposer({
    selectedId,
    input,
    sending,
    sendingVoice,
    isRecordingVoice,
    editingMessageId,
    replyTarget,
    loadSessions,
    setInput,
    setSending,
    setMessages,
    setReplyTarget,
    setEditingMessageId,
    setSendingVoice,
    setIsRecordingVoice,
    setRecordingStartedAt,
    lastMsgIdRef,
    mediaRecorderRef,
    mediaStreamRef,
    recordingStartedAtRef,
    voiceChunksRef,
  });

  const {
    handleGenerateVoiceToken,
    handleArchiveSession,
    handleDeleteSession,
    handleDownloadSession,
    handleDeleteMessages,
  } = useAdminChatActions({
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
  });

  const toggleMessageSelection = useCallback((messageId: number) => {
    setSelectedMessageIds((prev) =>
      prev.includes(messageId) ? prev.filter((id) => id !== messageId) : [...prev, messageId],
    );
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  };

  const formatTime = formatAdminChatTime;

  const jumpToMessage = useCallback((messageId: number) => {
    const element = messageRefs.current.get(messageId);
    if (!element) {
      return;
    }

    element.scrollIntoView({ behavior: "smooth", block: "center" });
    element.classList.add("ring-2", "ring-sage");
    setTimeout(() => {
      element.classList.remove("ring-2", "ring-sage");
    }, 1800);
  }, []);

  const getMessagePreview = useCallback((message: Message) => {
    if (message.isDeleted) {
      return "Сообщение удалено";
    }

    return getChatMessagePreviewText(message.content) ?? "Системное сообщение";
  }, []);

  const clearLongPress = useCallback(() => {
    if (longPressRef.current) {
      clearTimeout(longPressRef.current);
      longPressRef.current = undefined;
    }
  }, []);

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node | null;
      if (contextMenuRef.current && target && contextMenuRef.current.contains(target)) {
        return;
      }

      setContextMenu(null);
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setContextMenu(null);
      }
    };

    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("keydown", handleEscape);
    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const openContextMenu = useCallback((message: Message, x: number, y: number) => {
    const panelRect = panelRef.current?.getBoundingClientRect();
    const relativeX = panelRect ? x - panelRect.left : x;
    const relativeY = panelRect ? y - panelRect.top : y;
    const panelWidth = panelRect?.width ?? relativeX;
    const panelHeight = panelRect?.height ?? relativeY;

    setContextMenu({
      message,
      left: Math.min(relativeX, Math.max(16, panelWidth - 220)),
      top: Math.min(relativeY, Math.max(16, panelHeight - 220)),
    });
  }, []);

  const handleReplyFromMenu = useCallback((message: Message) => {
    setEditingMessageId(null);
    setReplyTarget(message);
    setContextMenu(null);
  }, []);

  const handleEditFromMenu = useCallback((message: Message) => {
    setEditingMessageId(message.id);
    setReplyTarget(null);
    setInput(message.content);
    setContextMenu(null);
  }, []);

  const handleSelectFromMenu = useCallback((messageId: number) => {
    toggleMessageSelection(messageId);
    setContextMenu(null);
  }, [toggleMessageSelection]);

  return (
    <div ref={panelRef} className="relative rounded-[2.5rem] border border-sage-light/20 border-white/40 bg-white/80 backdrop-blur-xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] overflow-hidden">
      <div className="flex h-[calc(100vh-220px)] min-h-[600px]">
        <AdminChatSessionList
          loading={loading}
          sessions={sessions}
          selectedId={selectedId}
          usage={usage}
          activeVoiceStats={activeVoiceStats}
          displayedUsageBytes={displayedUsageBytes}
          displayedUsagePercent={displayedUsagePercent}
          formatTime={formatTime}
          onSelectSession={setSelectedId}
        />

        <div className={`relative flex-1 bg-white/40 ${!selectedId ? "hidden md:flex" : "flex"}`}>
          <div className="flex h-full min-w-0">
            <div className="relative flex min-w-0 flex-1 flex-col">
          {activeVoiceToken ? (
            <VoiceCallBoundary
              onClose={() => setActiveVoiceToken(null)}
              onReset={() => {
                const token = activeVoiceToken;
                setActiveVoiceToken(null);
                if (token) {
                  setTimeout(() => setActiveVoiceToken(token), 0);
                }
              }}
            >
              <VoiceCallPanel
                token={activeVoiceToken}
                role="admin"
                title={selectedSession?.visitorName || `Посетитель #${selectedId}`}
                onStatsChange={setActiveVoiceStats}
                onClose={() => setActiveVoiceToken(null)}
              />
            </VoiceCallBoundary>
          ) : null}

          {!selectedId ? (
            <AdminChatEmptyState />
          ) : (
            <>
              <AdminChatSessionHeader
                selectedId={selectedId}
                selectedSessionName={selectedSession?.visitorName || ""}
                createdAt={selectedSession?.createdAt || ""}
                archivingSession={archivingSession}
                deletingSession={deletingSession}
                downloadingSession={downloadingSession}
                formatTime={formatTime}
                onBack={() => setSelectedId(null)}
                onArchive={handleArchiveSession}
                onDownload={handleDownloadSession}
                onDelete={handleDeleteSession}
              />

              <AdminChatMessageList
                messages={messages}
                selectedSessionName={selectedSession?.visitorName || ""}
                selectedMessageIds={selectedMessageIds}
                messagesEndRef={messagesEndRef}
                onJumpToMessage={jumpToMessage}
                onOpenContextMenu={openContextMenu}
                onToggleSelection={toggleMessageSelection}
                onEditMessage={handleEditFromMenu}
                onClearLongPress={clearLongPress}
                setLongPressTimeout={(callback) => {
                  longPressRef.current = setTimeout(callback, 450);
                }}
                setMessageRef={(messageId, node) => {
                  messageRefs.current.set(messageId, node);
                }}
                formatTime={formatTime}
              />

              <AdminChatComposer
                selectedMessageIds={selectedMessageIds}
                deletingMessages={deletingMessages}
                creatingVoiceToken={creatingVoiceToken}
                replyTarget={replyTarget}
                editingMessageId={editingMessageId}
                input={input}
                sending={sending}
                sendingVoice={sendingVoice}
                isRecordingVoice={isRecordingVoice}
                recordingStartedAt={recordingStartedAt}
                selectedSession={selectedSession}
                getMessagePreview={getMessagePreview}
                formatTime={formatTime}
                onClearSelection={() => {
                  setSelectedMessageIds([]);
                }}
                onDeleteMessages={() => {
                  void handleDeleteMessages();
                }}
                onGenerateVoiceToken={() => {
                  void handleGenerateVoiceToken();
                }}
                onClearReply={() => setReplyTarget(null)}
                onCancelEditing={() => {
                  setEditingMessageId(null);
                  setInput("");
                }}
                onInputChange={setInput}
                onKeyDown={handleKeyDown}
                onToggleVoiceRecording={() => {
                  void handleToggleVoiceRecording();
                }}
                onSend={() => {
                  void handleSend();
                }}
              />
            </>
          )}
            </div>

            {selectedId ? (
              <AdminVoiceEventsSidebar
                selectedId={selectedId}
                selectedSessionName={selectedSession?.visitorName || ""}
                voiceEvents={voiceEvents}
                formatTime={formatTime}
                onRefresh={() => {
                  void loadVoiceEvents(selectedId);
                }}
              />
            ) : null}
          </div>
        </div>
      </div>

      <AdminChatContextMenu
        contextMenu={contextMenu}
        contextMenuPosition={contextMenuPosition}
        contextMenuRef={contextMenuRef}
        selectedMessageIds={selectedMessageIds}
        onReply={handleReplyFromMenu}
        onEdit={handleEditFromMenu}
        onSelect={handleSelectFromMenu}
      />
    </div>
  );
}


