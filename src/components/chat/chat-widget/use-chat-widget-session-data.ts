import { useEffect } from "react";

import { useChatWidgetHandleOpen } from "@/components/chat/chat-widget/use-chat-widget-handle-open";
import { useChatWidgetInitSession } from "@/components/chat/chat-widget/use-chat-widget-init-session";
import { useChatWidgetMessagePolling } from "@/components/chat/chat-widget/use-chat-widget-message-polling";
import { useChatWidgetSyncVoiceInvite } from "@/components/chat/chat-widget/use-chat-widget-sync-voice-invite";
import { useChatWidgetVoiceInvite } from "@/components/chat/chat-widget/use-chat-widget-voice-invite";
import type { Message, VoiceInvite } from "@/components/chat/chat-widget/types";
import { getStoredVisitorName } from "@/components/chat/chat-widget/utils";

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
  const syncVoiceInvite = useChatWidgetSyncVoiceInvite({
    activeVoiceToken,
    setAvailableVoiceInvite,
    setActiveVoiceToken,
  });

  useEffect(() => {
    const storedName = getStoredVisitorName();
    setVisitorName(storedName);
    setPendingVisitorName(storedName);
  }, [setPendingVisitorName, setVisitorName]);

  const initSession = useChatWidgetInitSession({
    visitorName,
    lastMsgIdRef,
    setError,
    setLoading,
    setMessages,
    setSessionId,
    syncVoiceInvite,
  });

  useChatWidgetMessagePolling({
    isOpen,
    sessionId,
    scrollToBottom,
    lastMsgIdRef,
    pollRef,
    setMessages,
    setHasUnread,
    syncVoiceInvite,
  });

  useChatWidgetVoiceInvite({
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

  const handleOpen = useChatWidgetHandleOpen({
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
