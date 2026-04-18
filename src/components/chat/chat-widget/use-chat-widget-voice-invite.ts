import { useEffect } from "react";

import type { VoiceInvite } from "@/components/chat/chat-widget/types";
import { useChatWidgetExpireVoiceInvite } from "@/components/chat/chat-widget/use-chat-widget-expire-voice-invite";
import { useChatWidgetRestoreVoiceToken } from "@/components/chat/chat-widget/use-chat-widget-restore-voice-token";
import { useChatWidgetVoiceInviteCountdown } from "@/components/chat/chat-widget/use-chat-widget-voice-invite-countdown";
import { useChatWidgetVoiceTokenStorage } from "@/components/chat/chat-widget/use-chat-widget-voice-token-storage";

type UseChatWidgetVoiceInviteParams = {
  isOpen: boolean;
  sessionId: number | null;
  activeVoiceToken: string | null;
  availableVoiceInvite: VoiceInvite | null;
  voiceCountdownNow: number;
  setAvailableVoiceInvite: React.Dispatch<React.SetStateAction<VoiceInvite | null>>;
  setActiveVoiceToken: React.Dispatch<React.SetStateAction<string | null>>;
  setVoiceCountdownNow: React.Dispatch<React.SetStateAction<number>>;
  syncVoiceInvite: (sessionId: number) => Promise<void>;
};

export function useChatWidgetVoiceInvite({
  isOpen,
  sessionId,
  activeVoiceToken,
  availableVoiceInvite,
  voiceCountdownNow,
  setAvailableVoiceInvite,
  setActiveVoiceToken,
  setVoiceCountdownNow,
  syncVoiceInvite,
}: UseChatWidgetVoiceInviteParams) {
  useChatWidgetVoiceTokenStorage({
    activeVoiceToken,
    sessionId,
  });

  useChatWidgetRestoreVoiceToken({
    activeVoiceToken,
    sessionId,
    setActiveVoiceToken,
  });

  useChatWidgetVoiceInviteCountdown({
    availableVoiceInvite,
    setVoiceCountdownNow,
  });

  useChatWidgetExpireVoiceInvite({
    activeVoiceToken,
    availableVoiceInvite,
    setAvailableVoiceInvite,
    setActiveVoiceToken,
    voiceCountdownNow,
  });

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
