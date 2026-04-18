import { useEffect } from "react";

import type { VoiceInvite } from "@/components/chat/chat-widget/types";
import { getVoiceSessionStorageKey } from "@/components/chat/chat-widget/utils";
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

  useEffect(() => {
    if (!availableVoiceInvite) {
      return;
    }

    setVoiceCountdownNow(Date.now());
    const interval = setInterval(() => {
      setVoiceCountdownNow(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, [availableVoiceInvite, setVoiceCountdownNow]);

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

  useEffect(() => {
    if (!sessionId || !isOpen || activeVoiceToken || !availableVoiceInvite) {
      return;
    }

    const interval = setInterval(() => {
      void syncVoiceInvite(sessionId);
    }, 1000);

    return () => clearInterval(interval);
  }, [activeVoiceToken, availableVoiceInvite, isOpen, sessionId, syncVoiceInvite]);

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
