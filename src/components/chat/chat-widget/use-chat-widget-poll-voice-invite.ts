import { useEffect } from "react";

import type { VoiceInvite } from "@/components/chat/chat-widget/types";

type UseChatWidgetPollVoiceInviteParams = {
  isOpen: boolean;
  sessionId: number | null;
  activeVoiceToken: string | null;
  availableVoiceInvite: VoiceInvite | null;
  syncVoiceInvite: (sessionId: number) => Promise<void>;
};

export function useChatWidgetPollVoiceInvite({
  isOpen,
  sessionId,
  activeVoiceToken,
  availableVoiceInvite,
  syncVoiceInvite,
}: UseChatWidgetPollVoiceInviteParams) {
  useEffect(() => {
    if (!sessionId || !isOpen || activeVoiceToken || !availableVoiceInvite) {
      return;
    }

    const interval = setInterval(() => {
      void syncVoiceInvite(sessionId);
    }, 1000);

    return () => clearInterval(interval);
  }, [activeVoiceToken, availableVoiceInvite, isOpen, sessionId, syncVoiceInvite]);
}
