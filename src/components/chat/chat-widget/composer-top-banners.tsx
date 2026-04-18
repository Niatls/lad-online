import { ChatWidgetComposerEditingBanner } from "@/components/chat/chat-widget/composer-editing-banner";
import { ChatWidgetComposerErrorBanner } from "@/components/chat/chat-widget/composer-error-banner";
import { ChatWidgetComposerReplyBanner } from "@/components/chat/chat-widget/composer-reply-banner";
import { ChatWidgetComposerVoiceInvite } from "@/components/chat/chat-widget/composer-voice-invite";
import type { Message, VoiceInvite } from "@/components/chat/chat-widget/types";

type ChatWidgetComposerTopBannersProps = {
  activeVoiceToken: string | null;
  availableVoiceInvite: VoiceInvite | null;
  editingMessageId: number | null;
  error: string | null;
  getMessagePreview: (message: Message) => string;
  replyTarget: Message | null;
  sessionId: number | null;
  voiceExpiresIn: string | null;
  onCancelEditing: () => void;
  onClearReply: () => void;
  onDismissError: () => void;
  onJoinVoice: (token: string) => void;
};

export function ChatWidgetComposerTopBanners({
  activeVoiceToken,
  availableVoiceInvite,
  editingMessageId,
  error,
  getMessagePreview,
  replyTarget,
  sessionId,
  voiceExpiresIn,
  onCancelEditing,
  onClearReply,
  onDismissError,
  onJoinVoice,
}: ChatWidgetComposerTopBannersProps) {
  return (
    <>
      {error && sessionId ? (
        <ChatWidgetComposerErrorBanner
          error={error}
          onDismissError={onDismissError}
        />
      ) : null}

      {availableVoiceInvite && !activeVoiceToken ? (
        <ChatWidgetComposerVoiceInvite
          availableVoiceInvite={availableVoiceInvite}
          voiceExpiresIn={voiceExpiresIn}
          onJoinVoice={onJoinVoice}
        />
      ) : null}

      {replyTarget ? (
        <ChatWidgetComposerReplyBanner
          replyTarget={replyTarget}
          getMessagePreview={getMessagePreview}
          onClearReply={onClearReply}
        />
      ) : null}

      {editingMessageId ? (
        <ChatWidgetComposerEditingBanner onCancelEditing={onCancelEditing} />
      ) : null}
    </>
  );
}
