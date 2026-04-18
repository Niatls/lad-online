import { useEffect } from "react";

import { getVoiceSessionStorageKey } from "@/components/chat/chat-widget/utils";

type UseChatWidgetRestoreVoiceTokenParams = {
  activeVoiceToken: string | null;
  sessionId: number | null;
  setActiveVoiceToken: React.Dispatch<React.SetStateAction<string | null>>;
};

export function useChatWidgetRestoreVoiceToken({
  activeVoiceToken,
  sessionId,
  setActiveVoiceToken,
}: UseChatWidgetRestoreVoiceTokenParams) {
  useEffect(() => {
    if (typeof window === "undefined" || !sessionId || activeVoiceToken) {
      return;
    }

    const storedToken = sessionStorage.getItem(getVoiceSessionStorageKey(sessionId));
    if (!storedToken) {
      return;
    }

    setActiveVoiceToken(storedToken);
  }, [activeVoiceToken, sessionId, setActiveVoiceToken]);
}
