import { ChatWidgetComposerFooter } from "@/components/chat/chat-widget/composer-footer";
import { ChatWidgetComposerInputBar } from "@/components/chat/chat-widget/composer-input-bar";
import { ChatWidgetComposerRecordingStatus } from "@/components/chat/chat-widget/composer-recording-status";

type ChatWidgetComposerBottomSectionProps = {
  editingMessageId: number | null;
  error: string | null;
  input: string;
  isRecordingVoice: boolean;
  loading: boolean;
  needsName: boolean;
  recordingStartedAt: number | null;
  sending: boolean;
  sendingVoice: boolean;
  sessionId: number | null;
  onInputChange: (value: string) => void;
  onKeyDown: (event: React.KeyboardEvent) => void;
  onSend: () => void;
  onToggleVoiceRecording: () => void;
};

export function ChatWidgetComposerBottomSection({
  editingMessageId,
  error,
  input,
  isRecordingVoice,
  loading,
  needsName,
  recordingStartedAt,
  sending,
  sendingVoice,
  sessionId,
  onInputChange,
  onKeyDown,
  onSend,
  onToggleVoiceRecording,
}: ChatWidgetComposerBottomSectionProps) {
  return (
    <>
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
    </>
  );
}
