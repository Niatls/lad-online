"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { MessageCircle, X, Send, Loader2, User } from "lucide-react";

type Message = {
  id: number;
  sender: string;
  content: string;
  createdAt: string;
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

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastMsgIdRef = useRef(0);
  const pollRef = useRef<ReturnType<typeof setInterval>>(undefined);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // Initialize session
  const initSession = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const visitorId = getVisitorId();
      const res = await fetch("/api/chat/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visitorId }),
      });
      if (res.ok) {
        const session = await res.json();
        setSessionId(session.id);
        setMessages(session.messages || []);
        if (session.messages?.length) {
          lastMsgIdRef.current = session.messages[session.messages.length - 1].id;
        }
      } else {
        setError("Не удалось подключиться к чату. Пожалуйста, попробуйте позже.");
      }
    } catch (err) {
      console.error("Failed to init chat:", err);
      setError("Ошибка сети. Проверьте соединение.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Poll for new messages
  const pollMessages = useCallback(async () => {
    if (!sessionId || !isOpen) return;
    try {
      const res = await fetch(`/api/chat/sessions/${sessionId}/messages?after=${lastMsgIdRef.current}`);
      if (res.ok) {
        const newMsgs: Message[] = await res.json();
        if (newMsgs.length > 0) {
          setMessages((prev) => {
            // Filter out any messages that might already be there (e.g. from optimistic updates that were subsequently matched)
            const existingIds = new Set(prev.map(m => m.id));
            const uniqueNew = newMsgs.filter(m => !existingIds.has(m.id));
            if (uniqueNew.length === 0) return prev;
            return [...prev, ...uniqueNew];
          });
          lastMsgIdRef.current = newMsgs[newMsgs.length - 1].id;
          // If chat is closed and admin responded, show unread indicator
          if (!isOpen && newMsgs.some((m) => m.sender === "admin")) {
            setHasUnread(true);
          }
          scrollToBottom();
        }
      }
    } catch {
      // silent fail on polling
    }
  }, [sessionId, isOpen, scrollToBottom]);

  useEffect(() => {
    if (sessionId && isOpen) {
      pollRef.current = setInterval(pollMessages, 3000);
      return () => clearInterval(pollRef.current);
    }
  }, [sessionId, isOpen, pollMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleOpen = () => {
    setIsOpen(true);
    setHasUnread(false);
    if (!sessionId) {
      initSession();
    }
  };

  const handleSend = async () => {
    if (!input.trim() || !sessionId || sending) return;
    if (error) setError(null);
    
    const text = input.trim();
    setInput("");
    setSending(true);

    // Optimistic update
    const tempId = Date.now();
    const optimistic: Message = {
      id: tempId,
      sender: "visitor",
      content: text,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);

    try {
      const res = await fetch(`/api/chat/sessions/${sessionId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: text, sender: "visitor" }),
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
      // Remove optimistic message on permanent failure
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
      setInput(text); // Restore input so user can try again
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

  return (
    <>
      {/* Floating button */}
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

      {/* Chat window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col w-[400px] max-w-[calc(100vw-48px)] h-[600px] max-h-[calc(100vh-96px)] rounded-[2.5rem] bg-white shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] border border-sage-light/20 overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-8 duration-500 ease-out">
          {/* Header */}
          <div className="relative shrink-0 overflow-hidden bg-forest p-6 text-white">
            {/* Background decorative element */}
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

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4 bg-[url('/bg-pattern.png')] bg-repeat bg-cream/10">
            {loading ? (
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
                  onClick={initSession}
                  className="px-6 py-2 rounded-xl bg-forest text-white text-sm font-bold shadow-lg hover:bg-forest/90 transition-all flex items-center gap-2 mx-auto active:scale-95"
                >
                  <Loader2 className={`h-3.5 w-3.5 animate-spin ${loading ? "block" : "hidden"}`} />
                  Попробовать снова
                </button>
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center py-12 px-6 flex flex-col items-center justify-center h-full">
                <div className="w-20 h-20 rounded-[2rem] bg-sage/10 flex items-center justify-center mb-6 rotate-12 transition-transform hover:rotate-0 duration-500">
                  <MessageCircle className="h-10 w-10 text-sage" />
                </div>
                <h4 className="text-forest font-bold text-xl mb-2">Привет! 👋</h4>
                <p className="text-forest/50 text-sm leading-relaxed max-w-[240px]">
                  Мы всегда на связи. Опишите вашу ситуацию, и наш специалист ответит вам в ближайшее время.
                </p>
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex animate-in fade-in slide-in-from-bottom-2 duration-300 ${msg.sender === "visitor" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-[1.5rem] px-5 py-3.5 text-sm leading-relaxed shadow-sm ${
                      msg.sender === "visitor"
                        ? "bg-forest text-white rounded-br-none"
                        : "bg-white text-forest border border-sage-light/20 rounded-bl-none"
                    }`}
                  >
                    {msg.content}
                    <div className={`text-[10px] mt-1.5 font-medium ${msg.sender === "visitor" ? "text-white/40" : "text-forest/30"}`}>
                      {new Date(msg.createdAt).toLocaleTimeString("ru", { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input container */}
          <div className="shrink-0 p-4 bg-white relative">
            {error && sessionId && (
              <div className="absolute -top-10 left-4 right-4 bg-red-50 text-red-600 text-[11px] font-bold px-3 py-1.5 rounded-lg border border-red-100 flex items-center justify-between animate-in slide-in-from-bottom-2">
                <span>{error}</span>
                <button onClick={() => setError(null)} className="p-0.5 hover:bg-red-100 rounded">
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}
            <div className="p-2 rounded-[1.75rem] bg-cream/30 border border-sage-light/20 flex items-end gap-2 focus-within:border-forest/20 focus-within:ring-4 focus-within:ring-forest/5 transition-all">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={error && !sessionId ? "Чат недоступен..." : "Ваше сообщение..."}
                disabled={!sessionId && !loading}
                rows={1}
                className="flex-1 resize-none bg-transparent px-4 py-3 text-sm text-forest placeholder:text-forest/30 outline-none max-h-[120px] disabled:opacity-50"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || sending || (!sessionId && !loading)}
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
