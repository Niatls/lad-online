import { ChatWidgetComposerBottomSection } from "@/components/chat/chat-widget/composer-bottom-section";
import { ChatWidgetComposerTopBanners } from "@/components/chat/chat-widget/composer-top-banners";
import type { Message, VoiceDraft, VoiceInvite } from "@/components/chat/chat-widget/types";

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
  mediaStreamRef: React.MutableRefObject<MediaStream | null>;
  needsName: boolean;
  sending: boolean;
  sendingVoice: boolean;
  isRecordingVoice: boolean;
  recordingStartedAt: number | null;
  voiceDraft: VoiceDraft | null;
  getMessagePreview: (message: Message) => string;
  onDismissError: () => void;
  onJoinVoice: (token: string) => void;
  onClearReply: () => void;
  onClearVoiceDraft: () => void;
  onCancelEditing: () => void;
  onInputChange: (value: string) => void;
  onKeyDown: (event: React.KeyboardEvent) => void;
  onSendVoiceDraft: () => void;
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
  mediaStreamRef,
  needsName,
  sending,
  sendingVoice,
  isRecordingVoice,
  recordingStartedAt,
  voiceDraft,
  getMessagePreview,
  onDismissError,
  onJoinVoice,
  onClearReply,
  onClearVoiceDraft,
  onCancelEditing,
  onInputChange,
  onKeyDown,
  onSendVoiceDraft,
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

      <ChatWidgetComposerBottomSection
        editingMessageId={editingMessageId}
        error={error}
        input={input}
        isRecordingVoice={isRecordingVoice}
        loading={loading}
        mediaStreamRef={mediaStreamRef}
        needsName={needsName}
        recordingStartedAt={recordingStartedAt}
        sending={sending}
        sendingVoice={sendingVoice}
        sessionId={sessionId}
        voiceDraft={voiceDraft}
        onClearVoiceDraft={onClearVoiceDraft}
        onInputChange={onInputChange}
        onKeyDown={onKeyDown}
        onSend={onSend}
        onSendVoiceDraft={onSendVoiceDraft}
        onToggleVoiceRecording={onToggleVoiceRecording}
      />
    </div>
  );
}
