import type { Message } from "@/components/chat/chat-widget/types";

type ApplyChatWidgetSessionInitParams = {
  lastMsgIdRef: React.MutableRefObject<number>;
  session: {
    id: number;
    messages?: Message[] | null;
  };
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  setSessionId: React.Dispatch<React.SetStateAction<number | null>>;
  syncVoiceInvite: (sessionId: number) => Promise<void>;
};

export function applyChatWidgetSessionInit({
  lastMsgIdRef,
  session,
  setMessages,
  setSessionId,
  syncVoiceInvite,
}: ApplyChatWidgetSessionInitParams) {
  setSessionId(session.id);
  setMessages(session.messages || []);

  if (session.messages?.length) {
    lastMsgIdRef.current = session.messages[session.messages.length - 1].id;
  }

  void syncVoiceInvite(session.id);
}
