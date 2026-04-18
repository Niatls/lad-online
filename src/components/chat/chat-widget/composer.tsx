import { ChatWidgetComposerFooter } from "@/components/chat/chat-widget/composer-footer";
import { ChatWidgetComposerInputBar } from "@/components/chat/chat-widget/composer-input-bar";
import { ChatWidgetComposerRecordingStatus } from "@/components/chat/chat-widget/composer-recording-status";
import { ChatWidgetComposerTopBanners } from "@/components/chat/chat-widget/composer-top-banners";
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
      <ChatWidgetComposerTopBanners
        activeVoiceToken={activeVoiceToken}
        availableVoiceInvite={availableVoiceInvite}
        editingMessageId={editingMessageId}
        error={error}
        getMessagePreview={getMessagePreview}
        replyTarget={replyTarget}
        sessionId={sessionId}
        voiceExpiresIn={voiceExpiresIn}
        onCancelEditing={onCancelEditing}
        onClearReply={onClearReply}
        onDismissError={onDismissError}
        onJoinVoice={onJoinVoice}
      />

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

      <ChatWidgetComposerFooter />
    </div>
  );
}
