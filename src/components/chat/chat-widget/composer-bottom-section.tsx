import { ChatWidgetComposerInputBar } from "@/components/chat/chat-widget/composer-input-bar";
import type { VoiceDraft } from "@/components/chat/chat-widget/types";

type ChatWidgetComposerBottomSectionProps = {
  editingMessageId: number | null;
  error: string | null;
  input: string;
  isRecordingVoice: boolean;
  loading: boolean;
  mediaStreamRef: React.MutableRefObject<MediaStream | null>;
  needsName: boolean;
  recordingStartedAt: number | null;
  sending: boolean;
  sendingVoice: boolean;
  sessionId: number | null;
  voiceDraft: VoiceDraft | null;
  voiceTranscript: string;
  onClearVoiceDraft: () => void;
  onInputChange: (value: string) => void;
  onKeyDown: (event: React.KeyboardEvent) => void;
  onSend: () => void;
  onSendVoiceDraft: () => void;
  onToggleVoiceRecording: () => void;
};

export function ChatWidgetComposerBottomSection({
  editingMessageId,
  error,
  input,
  isRecordingVoice,
  loading,
  mediaStreamRef,
  needsName,
  recordingStartedAt,
  sending,
  sendingVoice,
  sessionId,
  voiceDraft,
  voiceTranscript,
  onClearVoiceDraft,
  onInputChange,
  onKeyDown,
  onSend,
  onSendVoiceDraft,
  onToggleVoiceRecording,
}: ChatWidgetComposerBottomSectionProps) {
  return (
    <ChatWidgetComposerInputBar
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
      voiceTranscript={voiceTranscript}
      onClearVoiceDraft={onClearVoiceDraft}
      onInputChange={onInputChange}
      onKeyDown={onKeyDown}
      onSend={onSend}
      onSendVoiceDraft={onSendVoiceDraft}
      onToggleVoiceRecording={onToggleVoiceRecording}
    />
  );
}
