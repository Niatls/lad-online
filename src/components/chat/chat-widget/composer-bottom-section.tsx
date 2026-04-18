import { ChatWidgetComposerFooter } from "@/components/chat/chat-widget/composer-footer";
import { ChatWidgetComposerInputBar } from "@/components/chat/chat-widget/composer-input-bar";
import { ChatWidgetComposerVoicePanel } from "@/components/chat/chat-widget/composer-voice-panel";
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
  onClearVoiceDraft,
  onInputChange,
  onKeyDown,
  onSend,
  onSendVoiceDraft,
  onToggleVoiceRecording,
}: ChatWidgetComposerBottomSectionProps) {
  return (
    <>
      <ChatWidgetComposerVoicePanel
        isRecordingVoice={isRecordingVoice}
        mediaStreamRef={mediaStreamRef}
        recordingStartedAt={recordingStartedAt}
        sendingVoice={sendingVoice}
        voiceDraft={voiceDraft}
        onClearVoiceDraft={onClearVoiceDraft}
        onSendVoiceDraft={onSendVoiceDraft}
        onToggleVoiceRecording={onToggleVoiceRecording}
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

      <ChatWidgetComposerFooter />
    </>
  );
}
