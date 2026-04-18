import { useChatWidgetRestoreVisitorName } from "@/components/chat/chat-widget/use-chat-widget-restore-visitor-name";
import { useChatWidgetSessionHandleOpen } from "@/components/chat/chat-widget/use-chat-widget-session-handle-open";
import { useChatWidgetSessionInit } from "@/components/chat/chat-widget/use-chat-widget-session-init";
import { useChatWidgetSessionMessagePolling } from "@/components/chat/chat-widget/use-chat-widget-session-message-polling";
import { useChatWidgetSessionSyncVoiceInvite } from "@/components/chat/chat-widget/use-chat-widget-session-sync-voice-invite";
import { useChatWidgetSessionVoiceInvite } from "@/components/chat/chat-widget/use-chat-widget-session-voice-invite";
import type { Message, VoiceInvite } from "@/components/chat/chat-widget/types";

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
  const syncVoiceInvite = useChatWidgetSessionSyncVoiceInvite({
    activeVoiceToken,
    setAvailableVoiceInvite,
    setActiveVoiceToken,
  });

  useChatWidgetRestoreVisitorName({
    setPendingVisitorName,
    setVisitorName,
  });

  const initSession = useChatWidgetSessionInit({
    visitorName,
    lastMsgIdRef,
    setError,
    setLoading,
    setMessages,
    setSessionId,
    syncVoiceInvite,
  });

  useChatWidgetSessionMessagePolling({
    isOpen,
    sessionId,
    scrollToBottom,
    lastMsgIdRef,
    pollRef,
    setMessages,
    setHasUnread,
    syncVoiceInvite,
  });

  useChatWidgetSessionVoiceInvite({
    isOpen,
    sessionId,
    activeVoiceToken,
    availableVoiceInvite,
    voiceCountdownNow,
    setAvailableVoiceInvite,
    setActiveVoiceToken,
    setVoiceCountdownNow,
    syncVoiceInvite,
  });

  const handleOpen = useChatWidgetSessionHandleOpen({
    visitorName,
    sessionId,
    setHasUnread,
    initSession,
  });

  return {
    syncVoiceInvite,
    initSession,
    handleOpen,
  };
}
