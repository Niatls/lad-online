import { useEffect } from "react";

import type { VoiceInvite } from "@/components/chat/chat-widget/types";

type UseChatWidgetVoiceInviteCountdownParams = {
  availableVoiceInvite: VoiceInvite | null;
  setVoiceCountdownNow: React.Dispatch<React.SetStateAction<number>>;
};

export function useChatWidgetVoiceInviteCountdown({
  availableVoiceInvite,
  setVoiceCountdownNow,
}: UseChatWidgetVoiceInviteCountdownParams) {
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
}
