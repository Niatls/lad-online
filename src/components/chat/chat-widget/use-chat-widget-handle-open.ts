import { useCallback } from "react";

type UseChatWidgetHandleOpenParams = {
  visitorName: string;
  sessionId: number | null;
  setHasUnread: React.Dispatch<React.SetStateAction<boolean>>;
  initSession: (nameOverride?: string) => Promise<void>;
};

export function useChatWidgetHandleOpen({
  visitorName,
  sessionId,
  setHasUnread,
  initSession,
}: UseChatWidgetHandleOpenParams) {
  return useCallback(() => {
    setHasUnread(false);
    if (!sessionId && visitorName.trim()) {
      void initSession(visitorName);
    }
  }, [initSession, sessionId, setHasUnread, visitorName]);
}
