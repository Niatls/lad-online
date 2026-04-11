"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MessageCircle, X, Send, Loader2, User, Phone, CornerUpLeft, Pencil } from "lucide-react";
import { VoiceCallBoundary } from "@/components/chat/voice-call-boundary";
import { VoiceCallPanel } from "@/components/chat/voice-call-panel";
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

type VoiceInvite = {
  token: string;
  status: string;
  expiresAt: string;
};

function getVisitorId(): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem("chat_visitor_id");
  if (!id) {
    id = `v_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    localStorage.setItem("chat_visitor_id", id);
  }
  return id;
}

function getStoredVisitorName(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("chat_visitor_name") ?? "";
}

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [visitorName, setVisitorName] = useState("");
  const [pendingVisitorName, setPendingVisitorName] = useState("");
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeVoiceToken, setActiveVoiceToken] = useState<string | null>(null);
  const [availableVoiceInvite, setAvailableVoiceInvite] = useState<VoiceInvite | null>(null);
  const [voiceCountdownNow, setVoiceCountdownNow] = useState(Date.now());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageRefs = useRef(new Map<number, HTMLDivElement | null>());
  const lastMsgIdRef = useRef(0);
  const pollRef = useRef<ReturnType<typeof setInterval>>(undefined);
  const [replyTarget, setReplyTarget] = useState<Message | null>(null);
  const [editingMessageId, setEditingMessageId] = useState<number | null>(null);

  const needsName = !visitorName.trim();

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

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
  }, [activeVoiceToken]);

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
  }, [syncVoiceInvite, visitorName]);

  useEffect(() => {
    const storedName = getStoredVisitorName();
    setVisitorName(storedName);
    setPendingVisitorName(storedName);
  }, []);

  const pollMessages = useCallback(async () => {
    if (!sessionId || !isOpen) return;
    try {
      const [messagesRes] = await Promise.all([
        fetch(`/api/chat/sessions/${sessionId}/messages?after=${lastMsgIdRef.current}`),
        syncVoiceInvite(sessionId),
      ]);
      if (messagesRes.ok) {
        const newMsgs: Message[] = await messagesRes.json();
        if (newMsgs.length > 0) {
          setMessages((prev) => {
            const existingIds = new Set(prev.map((m) => m.id));
            const uniqueNew = newMsgs.filter((m) => !existingIds.has(m.id));
            if (uniqueNew.length === 0) return prev;
            return [...prev, ...uniqueNew];
          });
          lastMsgIdRef.current = newMsgs[newMsgs.length - 1].id;
          if (!isOpen && newMsgs.some((m) => m.sender === "admin" || m.sender === "system")) {
            setHasUnread(true);
          }
          scrollToBottom();
        }
      }
    } catch {
      // silent fail on polling
    }
  }, [isOpen, scrollToBottom, sessionId, syncVoiceInvite]);

  useEffect(() => {
    if (sessionId && isOpen) {
      pollRef.current = setInterval(pollMessages, 3000);
      return () => clearInterval(pollRef.current);
    }
  }, [sessionId, isOpen, pollMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (!availableVoiceInvite) {
      return;
    }

    setVoiceCountdownNow(Date.now());
    const interval = setInterval(() => {
      setVoiceCountdownNow(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, [availableVoiceInvite]);

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
  }, [activeVoiceToken, availableVoiceInvite, voiceCountdownNow]);

  useEffect(() => {
    if (!sessionId || !isOpen || activeVoiceToken || !availableVoiceInvite) {
      return;
    }

    const interval = setInterval(() => {
      void syncVoiceInvite(sessionId);
    }, 1000);

    return () => clearInterval(interval);
  }, [activeVoiceToken, availableVoiceInvite, isOpen, sessionId, syncVoiceInvite]);

  const handleOpen = () => {
    setIsOpen(true);
    setHasUnread(false);
    if (!sessionId && visitorName.trim()) {
      void initSession(visitorName);
    }
  };

  const handleSaveName = async () => {
    const normalized = pendingVisitorName.trim();
    if (!normalized) {
      return;
    }

    localStorage.setItem("chat_visitor_name", normalized);
    setVisitorName(normalized);
    setPendingVisitorName(normalized);
    await initSession(normalized);
  };

  const handleSend = async () => {
    if (!input.trim() || !sessionId || sending) return;
    if (error) setError(null);

    const text = input.trim();
    if (editingMessageId) {
      setSending(true);
      try {
        const res = await fetch(`/api/chat/sessions/${sessionId}/messages`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messageId: editingMessageId, content: text, sender: "visitor" }),
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
        setError("Не удалось сохранить изменения.");
      } finally {
        setSending(false);
      }
      return;
    }

    const currentReplyTarget = replyTarget;
    setInput("");
    setSending(true);

    const tempId = Date.now();
    const optimistic: Message = {
      id: tempId,
      sender: "visitor",
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
      const res = await fetch(`/api/chat/sessions/${sessionId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: text, sender: "visitor", replyToId: optimistic.replyToId }),
      });

      if (res.ok) {
        const msg = await res.json();
        setMessages((prev) => prev.map((m) => (m.id === tempId ? msg : m)));
        lastMsgIdRef.current = Math.max(lastMsgIdRef.current, msg.id);
      } else {
        throw new Error("Failed to send");
      }
    } catch (err) {
      console.error("Failed to send:", err);
      setError("Не удалось отправить сообщение.");
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
      setInput(text);
      setReplyTarget(currentReplyTarget);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const voiceExpiresIn = useMemo(() => {
    if (!availableVoiceInvite) return null;
    const seconds = Math.max(0, Math.floor((new Date(availableVoiceInvite.expiresAt).getTime() - voiceCountdownNow) / 1000));
    const minutes = Math.floor(seconds / 60);
    const remSeconds = seconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(remSeconds).padStart(2, "0")}`;
  }, [availableVoiceInvite, voiceCountdownNow]);

  const visibleMessages = messages.filter((msg) => !parseVoiceInviteToken(msg.content));

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
    const isVisitor = msg.sender === "visitor";
    const isSystem = msg.sender === "system";
    const canEdit = isVisitor && !isSystem && !msg.isDeleted;

    return (
      <div
        key={msg.id}
        ref={(node) => {
          messageRefs.current.set(msg.id, node);
        }}
        className={`flex animate-in fade-in slide-in-from-bottom-2 duration-300 ${
          isSystem ? "justify-center" : isVisitor ? "justify-end" : "justify-start"
        }`}
      >
        <div
          className={`max-w-[85%] rounded-[1.5rem] px-5 py-3.5 text-sm leading-relaxed shadow-sm ${
            isSystem
              ? "bg-cream text-forest border border-sage-light/20"
              : isVisitor
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
                  : isVisitor
                    ? "border-white/10 bg-white/10 text-white/80"
                    : "border-sage-light/20 bg-cream/40 text-forest/60"
              }`}
            >
              <p className="font-bold mb-0.5">{msg.replyTo.sender === "visitor" ? "Вы" : msg.replyTo.sender === "admin" ? "Поддержка" : "Система"}</p>
              <p className="truncate">{msg.replyTo.isDeleted ? "Сообщение удалено" : msg.replyTo.content}</p>
            </button>
          ) : null}
          <p className={msg.isDeleted ? "italic opacity-70" : ""}>
            {msg.isDeleted ? "Сообщение удалено" : msg.content}
          </p>
          <div
            className={`text-[10px] mt-1.5 font-medium ${
              isSystem ? "text-forest/35" : isVisitor ? "text-white/40" : "text-forest/30"
            }`}
          >
            {new Date(msg.createdAt).toLocaleTimeString("ru", { hour: "2-digit", minute: "2-digit" })}
            {msg.isEdited ? " · изменено" : ""}
          </div>
        </div>
        {!isSystem ? (
          <div className="self-end mb-1 ml-2 mr-2 flex flex-col gap-2">
            {canEdit ? (
              <button
                type="button"
                onClick={() => {
                  setEditingMessageId(msg.id);
                  setReplyTarget(null);
                  setInput(msg.content);
                }}
                className="rounded-full border border-sage-light/20 bg-white/90 p-2 text-forest/45 transition hover:text-forest hover:bg-white"
                aria-label="Редактировать"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => {
                setEditingMessageId(null);
                setReplyTarget(msg);
              }}
              className="rounded-full border border-sage-light/20 bg-white/90 p-2 text-forest/45 transition hover:text-forest hover:bg-white"
              aria-label="Ответить"
            >
              <CornerUpLeft className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : null}
      </div>
    );
  };

  return (
    <>
      {!isOpen && (
        <button
          onClick={handleOpen}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full bg-gradient-to-br from-forest to-forest-light px-6 py-4 text-white shadow-[0_20px_50px_rgba(45,63,45,0.3)] transition-all hover:shadow-[0_20px_60px_rgba(45,63,45,0.4)] hover:-translate-y-1 active:scale-95 active:translate-y-0 group border border-white/10"
        >
          <div className="relative">
            <MessageCircle className="h-6 w-6 transition-transform group-hover:scale-110" />
            {hasUnread && (
              <span className="absolute -top-1.5 -right-1.5 h-3.5 w-3.5 rounded-full bg-red-500 border-2 border-forest ring-2 ring-red-500/30 animate-pulse" />
            )}
          </div>
          <span className="text-sm font-bold tracking-tight hidden sm:inline">Задать вопрос</span>
        </button>
      )}

      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col w-[400px] max-w-[calc(100vw-48px)] h-[600px] max-h-[calc(100vh-96px)] rounded-[2.5rem] bg-white shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] border border-sage-light/20 overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-8 duration-500 ease-out">
          {activeVoiceToken ? (
            <VoiceCallBoundary
              onClose={() => {
                setActiveVoiceToken(null);
                setAvailableVoiceInvite(null);
                if (sessionId) {
                  void syncVoiceInvite(sessionId);
                }
              }}
              onReset={() => {
                setActiveVoiceToken(null);
                setTimeout(() => setActiveVoiceToken(activeVoiceToken), 0);
              }}
            >
              <VoiceCallPanel
                token={activeVoiceToken}
                role="visitor"
                title="Поддержка Лад"
                onClose={() => {
                  setActiveVoiceToken(null);
                  setAvailableVoiceInvite(null);
                  if (sessionId) {
                    void syncVoiceInvite(sessionId);
                  }
                }}
              />
            </VoiceCallBoundary>
          ) : null}

          <div className="relative shrink-0 overflow-hidden bg-forest p-6 text-white">
            <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-sage-light/10 blur-3xl" />

            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                    <User className="h-6 w-6 text-white" />
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-green-400 border-2 border-forest" />
                </div>
                <div>
                  <h3 className="font-bold text-lg tracking-tight">Поддержка Лад</h3>
                  <div className="flex items-center gap-1.5 text-white/70 text-xs">
                    <div className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
                    Онлайн
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-2xl bg-white/10 hover:bg-white/20 transition-all border border-white/10"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4 bg-[url('/bg-pattern.png')] bg-repeat bg-cream/10">
            {needsName ? (
              <div className="flex flex-col items-center justify-center h-full gap-5 px-4 text-center">
                <div className="w-20 h-20 rounded-[2rem] bg-sage/10 flex items-center justify-center">
                  <User className="h-10 w-10 text-sage" />
                </div>
                <div>
                  <h4 className="text-forest font-bold text-xl mb-2">Как к вам обращаться?</h4>
                  <p className="text-forest/50 text-sm leading-relaxed max-w-[260px]">
                    Укажите имя или псевдоним. Так специалист сможет обратиться к вам в чате и при голосовом общении.
                  </p>
                </div>
                <div className="w-full max-w-[280px] space-y-3">
                  <input
                    value={pendingVisitorName}
                    onChange={(e) => setPendingVisitorName(e.target.value)}
                    placeholder="Имя или псевдоним"
                    className="w-full rounded-2xl border border-sage-light/20 bg-white px-4 py-3 text-sm text-forest outline-none focus:border-forest/30"
                  />
                  <button
                    type="button"
                    onClick={handleSaveName}
                    disabled={!pendingVisitorName.trim() || loading}
                    className="w-full rounded-2xl bg-forest px-4 py-3 text-sm font-bold text-white shadow-lg shadow-forest/15 transition hover:bg-forest/90 disabled:opacity-50"
                  >
                    {loading ? "Подключаем..." : "Продолжить"}
                  </button>
                </div>
              </div>
            ) : loading ? (
              <div className="flex flex-col items-center justify-center h-full gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-sage" />
                <p className="text-forest/40 text-sm font-medium">Подключаемся...</p>
              </div>
            ) : error && !sessionId ? (
              <div className="text-center py-12 px-6 flex flex-col items-center justify-center h-full">
                <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-4">
                  <X className="h-8 w-8 text-red-500/50" />
                </div>
                <p className="text-forest/70 text-sm font-medium mb-4">{error}</p>
                <button
                  onClick={() => void initSession()}
                  className="px-6 py-2 rounded-xl bg-forest text-white text-sm font-bold shadow-lg hover:bg-forest/90 transition-all flex items-center gap-2 mx-auto active:scale-95"
                >
                  <Loader2 className={`h-3.5 w-3.5 animate-spin ${loading ? "block" : "hidden"}`} />
                  Попробовать снова
                </button>
              </div>
            ) : visibleMessages.length === 0 ? (
              <div className="text-center py-12 px-6 flex flex-col items-center justify-center h-full">
                <div className="w-20 h-20 rounded-[2rem] bg-sage/10 flex items-center justify-center mb-6 rotate-12 transition-transform hover:rotate-0 duration-500">
                  <MessageCircle className="h-10 w-10 text-sage" />
                </div>
                <h4 className="text-forest font-bold text-xl mb-2">Привет, {visitorName || "друг"}!</h4>
                <p className="text-forest/50 text-sm leading-relaxed max-w-[240px]">
                  Мы всегда на связи. Опишите вашу ситуацию, и наш специалист ответит вам в ближайшее время.
                </p>
              </div>
            ) : (
              visibleMessages.map(renderMessage)
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="shrink-0 p-4 bg-white relative">
            {error && sessionId && (
              <div className="absolute -top-10 left-4 right-4 bg-red-50 text-red-600 text-[11px] font-bold px-3 py-1.5 rounded-lg border border-red-100 flex items-center justify-between animate-in slide-in-from-bottom-2">
                <span>{error}</span>
                <button onClick={() => setError(null)} className="p-0.5 hover:bg-red-100 rounded">
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}
            {availableVoiceInvite && !activeVoiceToken ? (
              <button
                type="button"
                onClick={() => setActiveVoiceToken(availableVoiceInvite.token)}
                className="mb-3 w-full rounded-[1.5rem] border border-sage-light/20 bg-forest px-4 py-3 text-left text-white shadow-lg shadow-forest/15 transition hover:bg-forest/90"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-2xl bg-white/12 flex items-center justify-center">
                      <Phone className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold">Голосовое общение</p>
                      <p className="text-[11px] text-white/70">Кнопка доступна ещё {voiceExpiresIn}</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em]">voice</span>
                </div>
              </button>
            ) : null}
            {replyTarget ? (
              <div className="mb-3 rounded-[1.25rem] border border-sage-light/20 bg-cream/35 px-4 py-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-forest/35">Ответ</p>
                    <p className="mt-1 text-xs font-bold text-forest">
                      {replyTarget.sender === "visitor" ? "Вы" : replyTarget.sender === "admin" ? "Поддержка" : "Система"}
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
              <div className="mb-3 rounded-[1.25rem] border border-sage-light/20 bg-cream/35 px-4 py-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-forest/35">Редактирование</p>
                    <p className="mt-1 text-xs text-forest/55">Измените текст и отправьте повторно.</p>
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
            <div className="p-2 rounded-[1.75rem] bg-cream/30 border border-sage-light/20 flex items-end gap-2 focus-within:border-forest/20 focus-within:ring-4 focus-within:ring-forest/5 transition-all">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={error && !sessionId ? "Чат недоступен..." : "Ваше сообщение..."}
                disabled={needsName || (!sessionId && !loading)}
                rows={1}
                className="flex-1 resize-none bg-transparent px-4 py-3 text-sm text-forest placeholder:text-forest/30 outline-none max-h-[120px] disabled:opacity-50"
              />
              <button
                onClick={handleSend}
                disabled={needsName || !input.trim() || sending || (!sessionId && !loading)}
                className="mb-1 p-3 rounded-2xl bg-forest text-white hover:bg-forest/90 transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-lg shadow-forest/20 active:scale-95"
              >
                {sending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
              </button>
            </div>
            <p className="text-[10px] text-center text-forest/30 mt-3 font-medium tracking-wide uppercase">
              Безопасный чат • Лад
            </p>
          </div>
        </div>
      )}
    </>
  );
}

