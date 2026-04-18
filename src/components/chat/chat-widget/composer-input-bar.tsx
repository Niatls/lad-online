import { ChatWidgetComposerFooter } from "@/components/chat/chat-widget/composer-footer";
import { ChatWidgetComposerSendButton } from "@/components/chat/chat-widget/composer-send-button";
import { ChatWidgetComposerTextarea } from "@/components/chat/chat-widget/composer-textarea";
import { ChatWidgetComposerVoicePanel } from "@/components/chat/chat-widget/composer-voice-panel";
import { ChatWidgetComposerVoiceToggleButton } from "@/components/chat/chat-widget/composer-voice-toggle-button";
import type { VoiceDraft } from "@/components/chat/chat-widget/types";

type ChatWidgetComposerInputBarProps = {
  error: string | null;
  sessionId: number | null;
  editingMessageId: number | null;
  input: string;
  loading: boolean;
  mediaStreamRef: React.MutableRefObject<MediaStream | null>;
  needsName: boolean;
  recordingStartedAt: number | null;
  sending: boolean;
  sendingVoice: boolean;
  isRecordingVoice: boolean;
  voiceDraft: VoiceDraft | null;
  voiceTranscript: string;
  onClearVoiceDraft: () => void;
  onInputChange: (value: string) => void;
  onKeyDown: (event: React.KeyboardEvent) => void;
  onToggleVoiceRecording: () => void;
  onSend: () => void;
  onSendVoiceDraft: () => void;
};

export function ChatWidgetComposerInputBar({
  error,
  sessionId,
  editingMessageId,
  input,
  loading,
  mediaStreamRef,
  needsName,
  recordingStartedAt,
  sending,
  sendingVoice,
  isRecordingVoice,
  voiceDraft,
  voiceTranscript,
  onClearVoiceDraft,
  onInputChange,
  onKeyDown,
  onToggleVoiceRecording,
  onSend,
  onSendVoiceDraft,
}: ChatWidgetComposerInputBarProps) {
  const hasVoiceState = isRecordingVoice || Boolean(voiceDraft);

  return (
    <>
      <div className="rounded-[1.75rem] border border-sage-light/20 bg-cream/30 p-2 transition-all focus-within:border-forest/20 focus-within:ring-4 focus-within:ring-forest/5">
        {hasVoiceState ? (
          <ChatWidgetComposerVoicePanel
            isRecordingVoice={isRecordingVoice}
            mediaStreamRef={mediaStreamRef}
            recordingStartedAt={recordingStartedAt}
            sendingVoice={sendingVoice}
            voiceDraft={voiceDraft}
            voiceTranscript={voiceTranscript}
            onClearVoiceDraft={onClearVoiceDraft}
            onSendVoiceDraft={onSendVoiceDraft}
            onToggleVoiceRecording={onToggleVoiceRecording}
          />
        ) : (
          <div className="flex items-end gap-2">
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
        )}
      </div>

      <ChatWidgetComposerFooter />
    </>
  );
}
