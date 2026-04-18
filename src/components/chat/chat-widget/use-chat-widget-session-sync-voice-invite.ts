import { useChatWidgetSyncVoiceInvite } from "@/components/chat/chat-widget/use-chat-widget-sync-voice-invite";
import type { VoiceInvite } from "@/components/chat/chat-widget/types";

type UseChatWidgetSessionSyncVoiceInviteParams = {
  activeVoiceToken: string | null;
  setAvailableVoiceInvite: React.Dispatch<React.SetStateAction<VoiceInvite | null>>;
  setActiveVoiceToken: React.Dispatch<React.SetStateAction<string | null>>;
};

export function useChatWidgetSessionSyncVoiceInvite({
  activeVoiceToken,
  setAvailableVoiceInvite,
  setActiveVoiceToken,
}: UseChatWidgetSessionSyncVoiceInviteParams) {
  return useChatWidgetSyncVoiceInvite({
    activeVoiceToken,
    setAvailableVoiceInvite,
    setActiveVoiceToken,
  });
}
