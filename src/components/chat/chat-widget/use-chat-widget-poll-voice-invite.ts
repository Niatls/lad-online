import { useEffect } from "react";

import type { VoiceInvite } from "@/components/chat/chat-widget/types";

const VOICE_INVITE_POLL_MS = 5_000;

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
    }, VOICE_INVITE_POLL_MS);

    return () => clearInterval(interval);
  }, [activeVoiceToken, availableVoiceInvite, isOpen, sessionId, syncVoiceInvite]);
}
