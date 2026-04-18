import { useChatWidgetInitSession } from "@/components/chat/chat-widget/use-chat-widget-init-session";
import type { Message } from "@/components/chat/chat-widget/types";

type UseChatWidgetSessionInitParams = {
  visitorName: string;
  lastMsgIdRef: React.MutableRefObject<number>;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  setSessionId: React.Dispatch<React.SetStateAction<number | null>>;
  syncVoiceInvite: (sessionId: number) => Promise<void>;
};

export function useChatWidgetSessionInit({
  visitorName,
  lastMsgIdRef,
  setError,
  setLoading,
  setMessages,
  setSessionId,
  syncVoiceInvite,
}: UseChatWidgetSessionInitParams) {
  return useChatWidgetInitSession({
    visitorName,
    lastMsgIdRef,
    setError,
    setLoading,
    setMessages,
    setSessionId,
    syncVoiceInvite,
  });
}
