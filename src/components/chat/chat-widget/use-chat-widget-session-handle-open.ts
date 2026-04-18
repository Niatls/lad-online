import { useChatWidgetHandleOpen } from "@/components/chat/chat-widget/use-chat-widget-handle-open";

type UseChatWidgetSessionHandleOpenParams = {
  visitorName: string;
  sessionId: number | null;
  setHasUnread: React.Dispatch<React.SetStateAction<boolean>>;
  initSession: (nameOverride?: string) => Promise<void>;
};

export function useChatWidgetSessionHandleOpen({
  visitorName,
  sessionId,
  setHasUnread,
  initSession,
}: UseChatWidgetSessionHandleOpenParams) {
  return useChatWidgetHandleOpen({
    visitorName,
    sessionId,
    setHasUnread,
    initSession,
  });
}
