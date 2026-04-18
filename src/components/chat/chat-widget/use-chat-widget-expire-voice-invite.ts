import { useEffect } from "react";

import type { VoiceInvite } from "@/components/chat/chat-widget/types";

type UseChatWidgetExpireVoiceInviteParams = {
  activeVoiceToken: string | null;
  availableVoiceInvite: VoiceInvite | null;
  setAvailableVoiceInvite: React.Dispatch<React.SetStateAction<VoiceInvite | null>>;
  setActiveVoiceToken: React.Dispatch<React.SetStateAction<string | null>>;
  voiceCountdownNow: number;
};

export function useChatWidgetExpireVoiceInvite({
  activeVoiceToken,
  availableVoiceInvite,
  setAvailableVoiceInvite,
  setActiveVoiceToken,
  voiceCountdownNow,
}: UseChatWidgetExpireVoiceInviteParams) {
  useEffect(() => {
    if (!availableVoiceInvite) {
      return;
    }

    if (new Date(availableVoiceInvite.expiresAt).getTime() <= voiceCountdownNow) {
      setAvailableVoiceInvite(null);
      if (activeVoiceToken === availableVoiceInvite.token) {
        setActiveVoiceToken(null);
      }
    }
  }, [activeVoiceToken, availableVoiceInvite, setActiveVoiceToken, setAvailableVoiceInvite, voiceCountdownNow]);
}
