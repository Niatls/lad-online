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
  CheckSquare,
  X,
} from "lucide-react";
import { VoiceCallPanel } from "@/components/chat/voice-call-panel";
import { VoiceCallBoundary } from "@/components/chat/voice-call-boundary";
import { parseVoiceInviteToken } from "@/lib/chat-message-format";

type Message = {
  id: number;
  sender: string;
  content: string;
  replyToId: number | null;
  deletedAt: string | null;
  deletedBy: string | null;
  editedAt: string | null;
  isEdited: boolean;
  isDeleted: boolean;
  replyTo: {
    id: number;
    sender: string;
    content: string;
    isDeleted: boolean;
  } | null;
  createdAt: string;
};

type Session = {
  id: number;
  visitorId: string;
  visitorName: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  messages: Message[];
  _count: { messages: number };
};

type UsageSummary = {
  totalBytes: number;
  inviteCount: number;
  monthlyCapBytes: number;
};

function formatUsage(value: number) {
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
  if (value < 1024 * 1024 * 1024) return `${(value / (1024 * 1024)).toFixed(2)} MB`;
  return `${(value / (1024 * 1024 * 1024)).toFixed(3)} GB`;
}

function getAdminVoiceSessionStorageKey(sessionId: number) {
  return `admin_active_voice_token_${sessionId}`;
}

export function AdminChatPanel() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [selectingMessages, setSelectingMessages] = useState(false);
  const [selectedMessageIds, setSelectedMessageIds] = useState<number[]>([]);
  const [replyTarget, setReplyTarget] = useState<Message | null>(null);
  const [editingMessageId, setEditingMessageId] = useState<number | null>(null);
  const [creatingVoiceToken, setCreatingVoiceToken] = useState(false);
  const [archivingSession, setArchivingSession] = useState(false);
  const [deletingSession, setDeletingSession] = useState(false);
  const [deletingMessages, setDeletingMessages] = useState(false);
  const [activeVoiceToken, setActiveVoiceToken] = useState<string | null>(null);
  const [usage, setUsage] = useState<UsageSummary>({
    totalBytes: 0,
    inviteCount: 0,
    monthlyCapBytes: 1000 * 1024 * 1024 * 1024,
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageRefs = useRef(new Map<number, HTMLDivElement | null>());
  const lastMsgIdRef = useRef(0);
  const pollRef = useRef<ReturnType<typeof setInterval>>(undefined);

  const selectedSession = useMemo(
    () => sessions.find((session) => session.id === selectedId) ?? null,
    [selectedId, sessions],
  );

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

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
  }, []);

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
  }, []);

  const pollMessages = useCallback(async () => {
    if (!selectedId) return;
    try {
      const res = await fetch(`/api/chat/sessions/${selectedId}/messages?after=${lastMsgIdRef.current}`);
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
  }, [selectedId, scrollToBottom]);

  useEffect(() => {
    if (selectedId) {
      lastMsgIdRef.current = 0;
      void loadMessages(selectedId);
      pollRef.current = setInterval(() => {
        void pollMessages();
      }, 2000);
      return () => clearInterval(pollRef.current);
    }
  }, [selectedId, loadMessages, pollMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

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
  }, [activeVoiceToken, selectedId]);

  const handleSend = async () => {
    if (!input.trim() || !selectedId || sending) return;
    const text = input.trim();
    if (editingMessageId) {
      setSending(true);
      try {
        const res = await fetch(`/api/chat/sessions/${selectedId}/messages`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messageId: editingMessageId, content: text, sender: "admin" }),
        });

        if (!res.ok) {
          throw new Error("Failed to edit");
        }

        const updated = await res.json();
        setMessages((prev) => prev.map((message) => (message.id === editingMessageId ? updated : message)));
        setEditingMessageId(null);
        setInput("");
      } catch (err) {
        console.error("Failed to edit:", err);
      } finally {
        setSending(false);
      }
      return;
    }

    const currentReplyTarget = replyTarget;
    setInput("");
    setSending(true);

    const optimistic: Message = {
      id: Date.now(),
      sender: "admin",
      content: text,
      replyToId: currentReplyTarget?.id ?? null,
      deletedAt: null,
      deletedBy: null,
      editedAt: null,
      isEdited: false,
      isDeleted: false,
      replyTo: currentReplyTarget
        ? {
            id: currentReplyTarget.id,
            sender: currentReplyTarget.sender,
            content: currentReplyTarget.isDeleted ? "Сообщение удалено" : currentReplyTarget.content,
            isDeleted: currentReplyTarget.isDeleted,
          }
        : null,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);
    setReplyTarget(null);

    try {
      const res = await fetch(`/api/chat/sessions/${selectedId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: text, sender: "admin", replyToId: currentReplyTarget?.id ?? null }),
      });
      if (res.ok) {
        const msg = await res.json();
        setMessages((prev) => prev.map((m) => (m.id === optimistic.id ? msg : m)));
        lastMsgIdRef.current = Math.max(lastMsgIdRef.current, msg.id);
      } else {
        throw new Error("Failed to send");
      }
    } catch (err) {
      console.error("Failed to send:", err);
      setReplyTarget(currentReplyTarget);
      setInput(text);
      setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
    } finally {
      setSending(false);
    }
  };

  const handleGenerateVoiceToken = async () => {
    if (!selectedId || creatingVoiceToken) return;

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
    } catch (err) {
      console.error("Failed to generate voice token:", err);
    } finally {
      setCreatingVoiceToken(false);
    }
  };

  const resetSelectedSession = async () => {
    setSelectedId(null);
    setMessages([]);
    setActiveVoiceToken(null);
    setSelectedMessageIds([]);
    setSelectingMessages(false);
    setReplyTarget(null);
    setEditingMessageId(null);
    await loadSessions();
  };

  const handleArchiveSession = async () => {
    if (!selectedId || archivingSession) return;
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
  };

  const handleDeleteSession = async () => {
    if (!selectedId || deletingSession) return;
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
  };

  const toggleMessageSelection = (messageId: number) => {
    setSelectedMessageIds((prev) =>
      prev.includes(messageId) ? prev.filter((id) => id !== messageId) : [...prev, messageId],
    );
  };

  const handleDeleteMessages = async () => {
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
      setSelectingMessages(false);
    } catch (err) {
      console.error("Failed to delete messages:", err);
    } finally {
      setDeletingMessages(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  };

  const formatTime = (date: string) => {
    const d = new Date(date);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    if (isToday) return d.toLocaleTimeString("ru", { hour: "2-digit", minute: "2-digit" });
    return (
      d.toLocaleDateString("ru", { day: "numeric", month: "short" }) +
      " " +
      d.toLocaleTimeString("ru", { hour: "2-digit", minute: "2-digit" })
    );
  };

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

    return message.content;
  }, []);

  const renderMessage = (msg: Message) => {
    const voiceToken = parseVoiceInviteToken(msg.content);
    if (voiceToken) {
      return null;
    }

    const isAdmin = msg.sender === "admin";
    const isSystem = msg.sender === "system";
    const isSelected = selectedMessageIds.includes(msg.id);
    const canSelect = !isSystem;
    const canEdit = isAdmin && !isSystem && !msg.isDeleted && !selectingMessages;

    return (
      <div
        key={msg.id}
        ref={(node) => {
          messageRefs.current.set(msg.id, node);
        }}
        className={`flex animate-in fade-in slide-in-from-bottom-2 duration-300 ${
          isSystem ? "justify-center" : isAdmin ? "justify-end" : "justify-start"
        }`}
      >
        {selectingMessages && canSelect ? (
          <button
            type="button"
            onClick={() => toggleMessageSelection(msg.id)}
            className={`mr-3 mt-2 h-6 w-6 shrink-0 rounded-full border text-[11px] font-bold transition ${
              isSelected ? "border-forest bg-forest text-white" : "border-sage-light/30 bg-white text-forest/45"
            }`}
          >
            {isSelected ? "OK" : ""}
          </button>
        ) : null}
        <div className={`flex flex-col ${isSystem ? "items-center" : isAdmin ? "items-end" : "items-start"} max-w-[70%]`}>
          <div
            className={`rounded-[1.75rem] px-5 py-4 text-sm leading-relaxed shadow-sm transition-all hover:shadow-md ${
              isSystem
                ? "bg-cream text-forest border border-sage-light/20"
                : isAdmin
                  ? "bg-forest text-white rounded-br-none"
                  : "bg-white text-forest border border-sage-light/20 rounded-bl-none"
            }`}
          >
            {msg.replyTo ? (
              <button
                type="button"
                onClick={() => jumpToMessage(msg.replyTo!.id)}
                className={`mb-2 w-full rounded-2xl border px-3 py-2 text-left text-xs transition ${
                  isSystem
                    ? "border-forest/10 bg-white/60 text-forest/70"
                    : isAdmin
                      ? "border-white/10 bg-white/10 text-white/80"
                      : "border-sage-light/20 bg-cream/40 text-forest/60"
                }`}
              >
                <p className="mb-0.5 font-bold">
                  {msg.replyTo.sender === "admin"
                    ? "Вы"
                    : msg.replyTo.sender === "visitor"
                      ? (selectedSession?.visitorName || "Пользователь")
                      : "Система"}
                </p>
                <p className="truncate">{msg.replyTo.isDeleted ? "Сообщение удалено" : msg.replyTo.content}</p>
              </button>
            ) : null}
            <p className={msg.isDeleted ? "italic opacity-70" : ""}>{msg.isDeleted ? "Сообщение удалено" : msg.content}</p>
          </div>
          <div className={`mt-2 flex items-center gap-2 ${isAdmin ? "flex-row-reverse" : "flex-row"}`}>
            <span className="text-[10px] font-bold text-forest/20 uppercase tracking-tighter">
              {formatTime(msg.createdAt)}
              {msg.isEdited ? " · изменено" : ""}
            </span>
            {canEdit ? (
              <button
                type="button"
                onClick={() => {
                  setEditingMessageId(msg.id);
                  setReplyTarget(null);
                  setInput(msg.content);
                }}
                className="rounded-full border border-sage-light/20 bg-white px-2 py-1 text-[10px] font-bold text-forest/45 transition hover:text-forest"
              >
                Ред.
              </button>
            ) : null}
            {!isSystem && !selectingMessages ? (
              <button
                type="button"
                onClick={() => {
                  setEditingMessageId(null);
                  setReplyTarget(msg);
                }}
                className="rounded-full border border-sage-light/20 bg-white px-2 py-1 text-[10px] font-bold text-forest/45 transition hover:text-forest"
              >
                Ответ
              </button>
            ) : null}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="rounded-[2.5rem] border border-sage-light/20 border-white/40 bg-white/80 backdrop-blur-xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] overflow-hidden">
      <div className="flex h-[calc(100vh-220px)] min-h-[600px]">
        <div className={`w-96 border-r border-sage-light/10 flex flex-col shrink-0 ${selectedId ? "hidden md:flex" : "flex w-full md:w-96"}`}>
          <div className="p-6 border-b border-sage-light/10 bg-white/40">
            <h2 className="text-xl font-bold text-forest flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-sage/10 flex items-center justify-center">
                <MessageCircle className="h-5 w-5 text-sage" />
              </div>
              Чаты
            </h2>
            <div className="flex items-center gap-2 mt-2">
              <span className="h-2 w-2 rounded-full bg-green-400" />
              <p className="text-[10px] font-bold text-forest/40 uppercase tracking-wider">{sessions.length} активных диалогов</p>
            </div>
            <div className="mt-3 rounded-[1.25rem] border border-sage-light/15 bg-cream/35 px-4 py-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-forest/35">Лимит voice за месяц</p>
              <p className="mt-1 text-base font-bold text-forest">{formatUsage(usage.totalBytes)} / {formatUsage(usage.monthlyCapBytes)}</p>
              <p className="mt-1 text-[11px] text-forest/45">{((usage.totalBytes / usage.monthlyCapBytes) * 100 || 0).toFixed(4)}% от лимита · {usage.inviteCount} звонков</p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1 bg-cream/5">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-sage/40" />
                <p className="text-forest/30 text-xs font-medium uppercase tracking-widest">Загрузка...</p>
              </div>
            ) : sessions.length === 0 ? (
              <div className="text-center py-24 px-8">
                <div className="w-16 h-16 rounded-[1.5rem] bg-sage/5 flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="h-8 w-8 text-sage/20" />
                </div>
                <p className="text-forest/30 text-sm font-medium">Нет активных диалогов</p>
              </div>
            ) : (
              sessions.map((s) => {
                const lastMsg = s.messages?.[0];
                const isActive = s.id === selectedId;
                return (
                  <button
                    key={s.id}
                    onClick={() => setSelectedId(s.id)}
                    className={`w-full text-left px-4 py-4 rounded-[1.5rem] transition-all duration-300 relative group overflow-hidden ${
                      isActive ? "bg-forest text-white shadow-xl shadow-forest/20" : "hover:bg-sage-light/10"
                    }`}
                  >
                    <div className="flex items-center gap-4 relative z-10">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border transition-colors ${
                        isActive ? "bg-white/10 border-white/20" : "bg-white border-sage-light/20 shadow-sm"
                      }`}>
                        <User className={`h-5 w-5 ${isActive ? "text-white" : "text-sage"}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline mb-0.5">
                          <span className={`font-bold text-sm truncate ${isActive ? "text-white" : "text-forest"}`}>
                            {s.visitorName || `Посетитель #${s.id}`}
                          </span>
                          <span className={`text-[10px] font-medium ml-2 shrink-0 ${isActive ? "text-white/50" : "text-forest/30"}`}>
                            {formatTime(s.updatedAt)}
                          </span>
                        </div>
                        <p className={`text-xs truncate ${isActive ? "text-white/70" : "text-forest/50"}`}>
                          {lastMsg ? (lastMsg.sender === "admin" ? "Вы: " : "") + lastMsg.content : "Новый диалог"}
                        </p>
                      </div>
                      {s._count.messages > 0 && !isActive && (
                        <span className="h-2 w-2 rounded-full bg-sage ring-4 ring-sage/10 shrink-0" />
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        <div className={`relative flex-1 flex flex-col bg-white/40 ${!selectedId ? "hidden md:flex" : "flex"}`}>
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
                onClose={() => setActiveVoiceToken(null)}
              />
            </VoiceCallBoundary>
          ) : null}

          {!selectedId ? (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center animate-in fade-in duration-700">
              <div className="w-24 h-24 rounded-[2.5rem] bg-sage/5 flex items-center justify-center mb-8 rotate-12">
                <MessageCircle className="h-12 w-12 text-sage/20" />
              </div>
              <h3 className="text-forest font-bold text-2xl mb-2 tracking-tight">Центр сообщений</h3>
              <p className="text-forest/40 text-sm max-w-xs leading-relaxed font-medium">
                Выберите диалог из списка слева, чтобы начать общение с посетителем в режиме реального времени.
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between gap-4 px-8 py-6 border-b border-sage-light/10 bg-white/60 backdrop-blur-md shrink-0">
                <div className="flex items-center gap-4 min-w-0">
                  <button
                    onClick={() => setSelectedId(null)}
                    className="md:hidden p-2 rounded-2xl hover:bg-sage-light/20 text-forest/60 transition-all border border-sage-light/10"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </button>
                  <div className="w-12 h-12 rounded-2xl bg-sage/10 flex items-center justify-center border border-sage-light/20">
                    <User className="h-6 w-6 text-sage" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-lg text-forest tracking-tight truncate">
                      {selectedSession?.visitorName || `Посетитель #${selectedId}`}
                    </h4>
                    <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                      <p className="text-[10px] uppercase font-bold tracking-widest text-forest/30 flex items-center gap-1.5">
                        <Clock className="h-3 w-3" />
                        Первый визит: {formatTime(selectedSession?.createdAt || "")}
                      </p>
                      <div className="h-1 w-1 rounded-full bg-forest/10" />
                      <p className="text-[10px] uppercase font-bold tracking-widest text-green-500 flex items-center gap-1">
                        <span className="h-1 w-1 rounded-full bg-green-500 animate-ping" />
                        Активен
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectingMessages((prev) => !prev);
                      setSelectedMessageIds([]);
                    }}
                    className={`inline-flex items-center gap-2 rounded-2xl border px-4 py-2.5 text-xs font-bold transition ${
                      selectingMessages
                        ? "border-forest/20 bg-forest text-white"
                        : "border-sage-light/20 bg-white text-forest"
                    }`}
                  >
                    <CheckSquare className="h-4 w-4" />
                    Выбрать
                  </button>
                  <button
                    type="button"
                    onClick={handleArchiveSession}
                    disabled={archivingSession}
                    className="inline-flex items-center gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-xs font-bold text-amber-700 transition hover:bg-amber-100 disabled:opacity-50"
                  >
                    {archivingSession ? <Loader2 className="h-4 w-4 animate-spin" /> : <Archive className="h-4 w-4" />}
                    Скрыть
                  </button>
                  <button
                    type="button"
                    onClick={handleDeleteSession}
                    disabled={deletingSession}
                    className="inline-flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-2.5 text-xs font-bold text-red-600 transition hover:bg-red-100 disabled:opacity-50"
                  >
                    {deletingSession ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                    Удалить навсегда
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-8 py-8 space-y-6 bg-cream/10">
                {messages.map(renderMessage)}
                <div ref={messagesEndRef} />
              </div>

              <div className="shrink-0 p-6 bg-white/60 backdrop-blur-md border-t border-sage-light/10">
                {selectedMessageIds.length > 0 ? (
                  <div className="mb-4 flex items-center justify-between gap-3 rounded-[1.5rem] border border-red-200 bg-red-50 px-4 py-3">
                    <div>
                      <p className="text-sm font-bold text-red-700">Выбрано сообщений: {selectedMessageIds.length}</p>
                      <p className="text-xs text-red-600/80">Удаление скроет их и для клиента тоже.</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedMessageIds([]);
                          setSelectingMessages(false);
                        }}
                        className="rounded-2xl border border-red-200 bg-white px-3 py-2 text-xs font-bold text-red-600 transition hover:bg-red-100"
                      >
                        Отмена
                      </button>
                      <button
                        type="button"
                        onClick={handleDeleteMessages}
                        disabled={deletingMessages}
                        className="inline-flex items-center gap-2 rounded-2xl bg-red-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-red-700 disabled:opacity-50"
                      >
                        {deletingMessages ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                        Удалить
                      </button>
                    </div>
                  </div>
                ) : null}

                <div className="mb-4 flex items-center justify-between gap-3 rounded-[1.5rem] border border-sage-light/15 bg-cream/35 px-4 py-3">
                  <div>
                    <p className="text-sm font-bold text-forest">Voice-режим</p>
                    <p className="text-xs text-forest/50">
                      Запустите голосовое общение для выбранного пользователя. Кнопка у клиента будет доступна 5 минут.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleGenerateVoiceToken}
                    disabled={creatingVoiceToken}
                    className="inline-flex items-center gap-2 rounded-2xl bg-forest px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-forest/15 transition hover:bg-forest/90 disabled:opacity-50"
                  >
                    {creatingVoiceToken ? <Loader2 className="h-4 w-4 animate-spin" /> : <Phone className="h-4 w-4" />}
                    Позвонить пользователю
                  </button>
                </div>

                {replyTarget ? (
                  <div className="mb-4 rounded-[1.5rem] border border-sage-light/20 bg-cream/35 px-4 py-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-forest/35">Ответ</p>
                        <p className="mt-1 text-xs font-bold text-forest">
                          {replyTarget.sender === "admin"
                            ? "Вы"
                            : replyTarget.sender === "visitor"
                              ? (selectedSession?.visitorName || "Пользователь")
                              : "Система"}
                        </p>
                        <p className="mt-1 truncate text-xs text-forest/55">{getMessagePreview(replyTarget)}</p>
                      </div>
                      <button type="button" onClick={() => setReplyTarget(null)} className="rounded-full p-1 text-forest/35 hover:bg-white/70 hover:text-forest">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ) : null}
                {editingMessageId ? (
                  <div className="mb-4 rounded-[1.5rem] border border-sage-light/20 bg-cream/35 px-4 py-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-forest/35">Редактирование</p>
                        <p className="mt-1 text-xs text-forest/55">Измените текст и отправьте сообщение ещё раз.</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingMessageId(null);
                          setInput("");
                        }}
                        className="rounded-full p-1 text-forest/35 hover:bg-white/70 hover:text-forest"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ) : null}

                <div className="flex items-end gap-3 p-2 rounded-[2rem] bg-cream/30 border border-sage-light/20 focus-within:border-forest/20 focus-within:ring-4 focus-within:ring-forest/5 transition-all">
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Введите ваш ответ здесь..."
                    rows={1}
                    className="flex-1 resize-none bg-transparent px-5 py-3.5 text-sm text-forest placeholder:text-forest/30 outline-none max-h-[150px]"
                  />
                  <button
                    onClick={() => void handleSend()}
                    disabled={!input.trim() || sending}
                    className="mb-1 p-3.5 rounded-2xl bg-forest text-white hover:bg-forest/90 transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-xl shadow-forest/20 active:scale-95 flex items-center justify-center"
                  >
                    {sending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}


