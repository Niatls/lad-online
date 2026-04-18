"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { X, Send, Loader2, Phone, Mic, Square } from "lucide-react";
import {
  ChatWidgetEmptyMessages,
  ChatWidgetErrorState,
  ChatWidgetLoadingState,
  ChatWidgetNameStep,
} from "@/components/chat/chat-widget/body-states";
import { ChatWidgetComposer } from "@/components/chat/chat-widget/composer";
import { ChatWidgetHeader } from "@/components/chat/chat-widget/header";
import { ChatWidgetLauncher } from "@/components/chat/chat-widget/launcher";
import { ChatWidgetMessageList } from "@/components/chat/chat-widget/message-list";
import type { Message, VoiceInvite } from "@/components/chat/chat-widget/types";
import { useChatWidgetComposer } from "@/components/chat/chat-widget/use-chat-widget-composer";
import { useChatWidgetSessionData } from "@/components/chat/chat-widget/use-chat-widget-session-data";
import { VoiceCallBoundary } from "@/components/chat/voice-call-boundary";
import { VoiceCallPanel } from "@/components/chat/voice-call-panel";
import { getChatMessagePreviewText, parseVoiceInviteToken } from "@/lib/chat-message-format";

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
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [sendingVoice, setSendingVoice] = useState(false);
  const [recordingStartedAt, setRecordingStartedAt] = useState<number | null>(null);
  const [activeVoiceToken, setActiveVoiceToken] = useState<string | null>(null);
  const [availableVoiceInvite, setAvailableVoiceInvite] = useState<VoiceInvite | null>(null);
  const [voiceCountdownNow, setVoiceCountdownNow] = useState(Date.now());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageRefs = useRef(new Map<number, HTMLDivElement | null>());
  const lastMsgIdRef = useRef(0);
  const pollRef = useRef<ReturnType<typeof setInterval>>(undefined);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const recordingStartedAtRef = useRef<number | null>(null);
  const voiceChunksRef = useRef<Blob[]>([]);
  const [replyTarget, setReplyTarget] = useState<Message | null>(null);
  const [editingMessageId, setEditingMessageId] = useState<number | null>(null);

  const needsName = !visitorName.trim();

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const { syncVoiceInvite, initSession, handleOpen } = useChatWidgetSessionData({
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
  });

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

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
  const { handleSend, handleToggleVoiceRecording } = useChatWidgetComposer({
    needsName,
    sessionId,
    input,
    sending,
    sendingVoice,
    isRecordingVoice,
    editingMessageId,
    replyTarget,
    setInput,
    setSending,
    setMessages,
    setReplyTarget,
    setEditingMessageId,
    setError,
    setSendingVoice,
    setIsRecordingVoice,
    setRecordingStartedAt,
    lastMsgIdRef,
    mediaRecorderRef,
    mediaStreamRef,
    recordingStartedAtRef,
    voiceChunksRef,
  });

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

    return getChatMessagePreviewText(message.content) ?? "Системное сообщение";
  }, []);

  return (
    <>
      {!isOpen ? (
        <ChatWidgetLauncher
          hasUnread={hasUnread}
          onOpen={() => {
            setIsOpen(true);
            handleOpen();
          }}
        />
      ) : null}

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

          <ChatWidgetHeader
            onClose={() => setIsOpen(false)}
          />

          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4 bg-[url('/bg-pattern.png')] bg-repeat bg-cream/10">
            {needsName ? (
              <ChatWidgetNameStep
                pendingVisitorName={pendingVisitorName}
                loading={loading}
                onChangeName={setPendingVisitorName}
                onSaveName={() => {
                  void handleSaveName();
                }}
              />
            ) : loading ? (
              <ChatWidgetLoadingState />
            ) : error && !sessionId ? (
              <ChatWidgetErrorState
                error={error}
                loading={loading}
                onRetry={() => {
                  void initSession();
                }}
              />
            ) : visibleMessages.length === 0 ? (
              <ChatWidgetEmptyMessages visitorName={visitorName} />
            ) : (
              <ChatWidgetMessageList
                messages={visibleMessages}
                messagesEndRef={messagesEndRef}
                onJumpToMessage={jumpToMessage}
                onReply={(message) => {
                  setEditingMessageId(null);
                  setReplyTarget(message);
                }}
                onEdit={(message) => {
                  setEditingMessageId(message.id);
                  setReplyTarget(null);
                  setInput(message.content);
                }}
                setMessageRef={(messageId, node) => {
                  messageRefs.current.set(messageId, node);
                }}
              />
            )}
          </div>

          <ChatWidgetComposer
            error={error}
            sessionId={sessionId}
            availableVoiceInvite={availableVoiceInvite}
            activeVoiceToken={activeVoiceToken}
            voiceExpiresIn={voiceExpiresIn}
            replyTarget={replyTarget}
            editingMessageId={editingMessageId}
            input={input}
            loading={loading}
            needsName={needsName}
            sending={sending}
            sendingVoice={sendingVoice}
            isRecordingVoice={isRecordingVoice}
            recordingStartedAt={recordingStartedAt}
            getMessagePreview={getMessagePreview}
            onDismissError={() => setError(null)}
            onJoinVoice={setActiveVoiceToken}
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
        </div>
      )}
    </>
  );
}

