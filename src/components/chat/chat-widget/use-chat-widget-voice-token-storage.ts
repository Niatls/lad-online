import { useEffect } from "react";

import { getVoiceSessionStorageKey } from "@/components/chat/chat-widget/utils";

type UseChatWidgetVoiceTokenStorageParams = {
  activeVoiceToken: string | null;
  sessionId: number | null;
};

export function useChatWidgetVoiceTokenStorage({
  activeVoiceToken,
  sessionId,
}: UseChatWidgetVoiceTokenStorageParams) {
  useEffect(() => {
    if (typeof window === "undefined" || !sessionId) {
      return;
    }

    const storageKey = getVoiceSessionStorageKey(sessionId);
    if (activeVoiceToken) {
      sessionStorage.setItem(storageKey, activeVoiceToken);
      return;
    }

    sessionStorage.removeItem(storageKey);
  }, [activeVoiceToken, sessionId]);
}
