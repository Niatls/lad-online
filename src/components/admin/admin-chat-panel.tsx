"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { MessageCircle, Send, Loader2, ArrowLeft, User, Clock, Phone, Trash2, Archive } from "lucide-react";
import { VoiceCallPanel } from "@/components/chat/voice-call-panel";
import { parseVoiceInviteToken } from "@/lib/chat-message-format";

type Message = {
  id: number;
  sender: string;
  content: string;
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

export function AdminChatPanel() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [creatingVoiceToken, setCreatingVoiceToken] = useState(false);
  const [archivingSession, setArchivingSession] = useState(false);
  const [deletingSession, setDeletingSession] = useState(false);
  const [activeVoiceToken, setActiveVoiceToken] = useState<string | null>(null);
  const [usage, setUsage] = useState<UsageSummary>({ totalBytes: 0, inviteCount: 0, monthlyCapBytes: 1000 * 1024 * 1024 * 1024 });
  const messagesEndRef = useRef<HTMLDivElement>(null);
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

  const handleSend = async () => {
    if (!input.trim() || !selectedId || sending) return;
    const text = input.trim();
    setInput("");
    setSending(true);

    const optimistic: Message = {
      id: Date.now(),
      sender: "admin",
      content: text,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);

    try {
      const res = await fetch(`/api/chat/sessions/${selectedId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: text, sender: "admin" }),
      });
      if (res.ok) {
        const msg = await res.json();
        setMessages((prev) => prev.map((m) => (m.id === optimistic.id ? msg : m)));
        lastMsgIdRef.current = Math.max(lastMsgIdRef.current, msg.id);
      }
    } catch (err) {
      console.error("Failed to send:", err);
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

  const renderMessage = (msg: Message) => {
    const voiceToken = parseVoiceInviteToken(msg.content);

    if (voiceToken) {
      return (
        <div key={msg.id} className="flex justify-center animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="w-full max-w-[78%] rounded-[1.75rem] border border-sage-light/20 bg-white px-5 py-4 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 h-11 w-11 rounded-2xl bg-forest text-white flex items-center justify-center shadow-lg shadow-forest/15">
                <Phone className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-forest">Голосовое общение готово</p>
                <p className="mt-1 text-xs leading-relaxed text-forest/55">
                  Пользователь увидит кнопку голосового общения под полем ввода и сможет подключиться в течение 5 минут.
                </p>
                <div className="mt-3 flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => setActiveVoiceToken(voiceToken)}
                    className="inline-flex items-center gap-2 rounded-2xl bg-forest px-4 py-2 text-xs font-bold text-white shadow-lg shadow-forest/15 transition hover:bg-forest/90"
                  >
                    <Phone className="h-4 w-4" />
                    Позвонить
                  </button>
                  <span className="rounded-full bg-cream px-3 py-1 text-[10px] font-bold tracking-[0.2em] text-forest/45 uppercase">
                    {voiceToken}
                  </span>
                </div>
              </div>
            </div>
            <div className="mt-2 text-[10px] font-bold text-forest/30 uppercase tracking-[0.2em]">
              {formatTime(msg.createdAt)}
            </div>
          </div>
        </div>
      );
    }

    const isAdmin = msg.sender === "admin";
    const isSystem = msg.sender === "system";

    return (
      <div
        key={msg.id}
        className={`flex animate-in fade-in slide-in-from-bottom-2 duration-300 ${
          isSystem ? "justify-center" : isAdmin ? "justify-end" : "justify-start"
        }`}
      >
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
            {msg.content}
          </div>
          <span className="text-[10px] font-bold text-forest/20 mt-2 uppercase tracking-tighter">
            {formatTime(msg.createdAt)}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="rounded-[2.5rem] border border-sage-light/20 bg-white/80 backdrop-blur-xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] overflow-hidden border border-white/40">
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
                const lastVoiceToken = lastMsg ? parseVoiceInviteToken(lastMsg.content) : null;
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
                          {lastMsg
                            ? lastVoiceToken
                              ? "Voice доступен"
                              : (lastMsg.sender === "admin" ? "Вы: " : "") + lastMsg.content
                            : "Новый диалог"}
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
            <VoiceCallPanel
              token={activeVoiceToken}
              role="admin"
              title={selectedSession?.visitorName || `Посетитель #${selectedId}`}
              onClose={() => setActiveVoiceToken(null)}
            />
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
                        <div className="h-1 w-1 rounded-full bg-green-500 animate-ping" />
                        Активен
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
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
