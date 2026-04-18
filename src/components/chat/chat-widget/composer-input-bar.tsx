import { ChatWidgetComposerSendButton } from "@/components/chat/chat-widget/composer-send-button";
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
      <textarea
        value={input}
        onChange={(event) => onInputChange(event.target.value)}
        onKeyDown={onKeyDown}
        placeholder={error && !sessionId ? "Р В Р’В§Р В Р’В°Р РЋРІР‚С™ Р В Р вЂ¦Р В Р’ВµР В РўвЂР В РЎвЂўР РЋР С“Р РЋРІР‚С™Р РЋРЎвЂњР В РЎвЂ”Р В Р’ВµР В Р вЂ¦..." : "Р В РІР‚в„ўР В Р’В°Р РЋРІвЂљВ¬Р В Р’Вµ Р РЋР С“Р В РЎвЂўР В РЎвЂўР В Р’В±Р РЋРІР‚В°Р В Р’ВµР В Р вЂ¦Р В РЎвЂР В Р’Вµ..."}
        disabled={needsName || (!sessionId && !loading)}
        rows={1}
        className="max-h-[120px] flex-1 resize-none bg-transparent px-4 py-3 text-sm text-forest outline-none placeholder:text-forest/30 disabled:opacity-50"
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
