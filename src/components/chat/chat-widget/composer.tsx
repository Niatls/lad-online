import { ChatWidgetComposerEditingBanner } from "@/components/chat/chat-widget/composer-editing-banner";
import { ChatWidgetComposerErrorBanner } from "@/components/chat/chat-widget/composer-error-banner";
import { ChatWidgetComposerInputBar } from "@/components/chat/chat-widget/composer-input-bar";
import { ChatWidgetComposerRecordingStatus } from "@/components/chat/chat-widget/composer-recording-status";
import { ChatWidgetComposerReplyBanner } from "@/components/chat/chat-widget/composer-reply-banner";
import { ChatWidgetComposerVoiceInvite } from "@/components/chat/chat-widget/composer-voice-invite";
import type { Message, VoiceInvite } from "@/components/chat/chat-widget/types";

type ChatWidgetComposerProps = {
  error: string | null;
  sessionId: number | null;
  availableVoiceInvite: VoiceInvite | null;
  activeVoiceToken: string | null;
  voiceExpiresIn: string | null;
  replyTarget: Message | null;
  editingMessageId: number | null;
  input: string;
  loading: boolean;
  needsName: boolean;
  sending: boolean;
  sendingVoice: boolean;
  isRecordingVoice: boolean;
  recordingStartedAt: number | null;
  getMessagePreview: (message: Message) => string;
  onDismissError: () => void;
  onJoinVoice: (token: string) => void;
  onClearReply: () => void;
  onCancelEditing: () => void;
  onInputChange: (value: string) => void;
  onKeyDown: (event: React.KeyboardEvent) => void;
  onToggleVoiceRecording: () => void;
  onSend: () => void;
};

export function ChatWidgetComposer({
  error,
  sessionId,
  availableVoiceInvite,
  activeVoiceToken,
  voiceExpiresIn,
  replyTarget,
  editingMessageId,
  input,
  loading,
  needsName,
  sending,
  sendingVoice,
  isRecordingVoice,
  recordingStartedAt,
  getMessagePreview,
  onDismissError,
  onJoinVoice,
  onClearReply,
  onCancelEditing,
  onInputChange,
  onKeyDown,
  onToggleVoiceRecording,
  onSend,
}: ChatWidgetComposerProps) {
  return (
    <div className="relative shrink-0 bg-white p-4">
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

      <ChatWidgetComposerInputBar
        error={error}
        sessionId={sessionId}
        editingMessageId={editingMessageId}
        input={input}
        loading={loading}
        needsName={needsName}
        sending={sending}
        sendingVoice={sendingVoice}
        isRecordingVoice={isRecordingVoice}
        onInputChange={onInputChange}
        onKeyDown={onKeyDown}
        onToggleVoiceRecording={onToggleVoiceRecording}
        onSend={onSend}
      />

      <ChatWidgetComposerRecordingStatus
        isRecordingVoice={isRecordingVoice}
        recordingStartedAt={recordingStartedAt}
      />

      <p className="mt-3 text-center text-[10px] font-medium uppercase tracking-wide text-forest/30">
        Р‘РµР·РѕРїР°СЃРЅС‹Р№ С‡Р°С‚ вЂў Р›Р°Рґ
      </p>
    </div>
  );
}
