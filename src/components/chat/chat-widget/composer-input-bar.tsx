import { Loader2, Send } from "lucide-react";

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
        placeholder={error && !sessionId ? "Р В§Р В°РЎвЂљ Р Р…Р ВµР Т‘Р С•РЎРѓРЎвЂљРЎС“Р С—Р ВµР Р…..." : "Р вЂ™Р В°РЎв‚¬Р Вµ РЎРѓР С•Р С•Р В±РЎвЂ°Р ВµР Р…Р С‘Р Вµ..."}
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

      <button
        onClick={onSend}
        disabled={needsName || !input.trim() || sending || (!sessionId && !loading)}
        className="mb-1 rounded-2xl bg-forest p-3 text-white shadow-lg shadow-forest/20 transition-all active:scale-95 hover:bg-forest/90 disabled:cursor-not-allowed disabled:opacity-30"
      >
        {sending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
      </button>
    </div>
  );
}
