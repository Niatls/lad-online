import { Loader2, Mic, Send, Square } from "lucide-react";

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
        placeholder={error && !sessionId ? "Р§Р°С‚ РЅРµРґРѕСЃС‚СѓРїРµРЅ..." : "Р’Р°С€Рµ СЃРѕРѕР±С‰РµРЅРёРµ..."}
        disabled={needsName || (!sessionId && !loading)}
        rows={1}
        className="max-h-[120px] flex-1 resize-none bg-transparent px-4 py-3 text-sm text-forest outline-none placeholder:text-forest/30 disabled:opacity-50"
      />
      <button
        type="button"
        onClick={onToggleVoiceRecording}
        disabled={needsName || sending || sendingVoice || (!sessionId && !loading) || Boolean(editingMessageId)}
        className={`mb-1 rounded-2xl p-3 shadow-lg transition-all active:scale-95 ${
          isRecordingVoice
            ? "bg-red-500 text-white shadow-red-500/20"
            : "border border-sage-light/20 bg-white text-forest hover:bg-cream/60"
        } disabled:cursor-not-allowed disabled:opacity-30`}
        aria-label={isRecordingVoice ? "РћСЃС‚Р°РЅРѕРІРёС‚СЊ Р·Р°РїРёСЃСЊ" : "Р—Р°РїРёСЃР°С‚СЊ РіРѕР»РѕСЃРѕРІРѕРµ"}
      >
        {sendingVoice ? <Loader2 className="h-5 w-5 animate-spin" /> : isRecordingVoice ? <Square className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
      </button>
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
