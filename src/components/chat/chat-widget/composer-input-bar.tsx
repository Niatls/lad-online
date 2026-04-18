import { ChatWidgetComposerSendButton } from "@/components/chat/chat-widget/composer-send-button";
import { ChatWidgetComposerTextarea } from "@/components/chat/chat-widget/composer-textarea";
import { ChatWidgetComposerVoiceToggleButton } from "@/components/chat/chat-widget/composer-voice-toggle-button";

type ChatWidgetComposerInputBarProps = {
  error: string | null;
  sessionId: number | null;
  editingMessageId: number | null;
  input: string;
  loading: boolean;
  needsName: boolean;
  sending: boolean;
  sendingVoice: boolean;
  isRecordingVoice: boolean;
  onInputChange: (value: string) => void;
  onKeyDown: (event: React.KeyboardEvent) => void;
  onToggleVoiceRecording: () => void;
  onSend: () => void;
};

export function ChatWidgetComposerInputBar({
  error,
  sessionId,
  editingMessageId,
  input,
  loading,
  needsName,
  sending,
  sendingVoice,
  isRecordingVoice,
  onInputChange,
  onKeyDown,
  onToggleVoiceRecording,
  onSend,
}: ChatWidgetComposerInputBarProps) {
  return (
    <div className="flex items-end gap-2 rounded-[1.75rem] border border-sage-light/20 bg-cream/30 p-2 transition-all focus-within:border-forest/20 focus-within:ring-4 focus-within:ring-forest/5">
      <ChatWidgetComposerTextarea
        error={error}
        input={input}
        loading={loading}
        needsName={needsName}
        sessionId={sessionId}
        onInputChange={onInputChange}
        onKeyDown={onKeyDown}
      />

      <ChatWidgetComposerVoiceToggleButton
        editingMessageId={editingMessageId}
        isRecordingVoice={isRecordingVoice}
        loading={loading}
        needsName={needsName}
        sending={sending}
        sendingVoice={sendingVoice}
        sessionId={sessionId}
        onToggleVoiceRecording={onToggleVoiceRecording}
      />

      <ChatWidgetComposerSendButton
        input={input}
        loading={loading}
        needsName={needsName}
        sending={sending}
        sessionId={sessionId}
        onSend={onSend}
      />
    </div>
  );
}
