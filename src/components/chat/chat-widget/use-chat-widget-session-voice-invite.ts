import { useChatWidgetVoiceInvite } from "@/components/chat/chat-widget/use-chat-widget-voice-invite";
import type { VoiceInvite } from "@/components/chat/chat-widget/types";

type UseChatWidgetSessionVoiceInviteParams = {
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

export function useChatWidgetSessionVoiceInvite({
  isOpen,
  sessionId,
  activeVoiceToken,
  availableVoiceInvite,
  voiceCountdownNow,
  setAvailableVoiceInvite,
  setActiveVoiceToken,
  setVoiceCountdownNow,
  syncVoiceInvite,
}: UseChatWidgetSessionVoiceInviteParams) {
  useChatWidgetVoiceInvite({
    isOpen,
    sessionId,
    activeVoiceToken,
    availableVoiceInvite,
    voiceCountdownNow,
    setAvailableVoiceInvite,
    setActiveVoiceToken,
    setVoiceCountdownNow,
    syncVoiceInvite,
  });
}
