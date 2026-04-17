import { useCallback } from "react";

import { fetchChatWidgetVoiceInvite } from "@/components/chat/chat-widget/session-data-api";
import type { VoiceInvite } from "@/components/chat/chat-widget/types";

type UseChatWidgetSyncVoiceInviteParams = {
  activeVoiceToken: string | null;
  setAvailableVoiceInvite: React.Dispatch<React.SetStateAction<VoiceInvite | null>>;
  setActiveVoiceToken: React.Dispatch<React.SetStateAction<string | null>>;
};

export function useChatWidgetSyncVoiceInvite({
  activeVoiceToken,
  setAvailableVoiceInvite,
  setActiveVoiceToken,
}: UseChatWidgetSyncVoiceInviteParams) {
  return useCallback(async (sessionId: number) => {
    try {
      const invite = await fetchChatWidgetVoiceInvite(sessionId);
      if (!invite || !["pending", "active"].includes(invite.status)) {
        setAvailableVoiceInvite(null);
        if (activeVoiceToken && invite?.token === activeVoiceToken) {
          setActiveVoiceToken(null);
        }
        return;
      }

      setAvailableVoiceInvite(invite);
    } catch {
      // keep current UI state on transient failures
    }
  }, [activeVoiceToken, setActiveVoiceToken, setAvailableVoiceInvite]);
}
