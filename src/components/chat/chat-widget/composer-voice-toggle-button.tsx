import { Loader2, Mic, Square } from "lucide-react";

type ChatWidgetComposerVoiceToggleButtonProps = {
  editingMessageId: number | null;
  isRecordingVoice: boolean;
  loading: boolean;
  needsName: boolean;
  sending: boolean;
  sendingVoice: boolean;
  sessionId: number | null;
  onToggleVoiceRecording: () => void;
};

export function ChatWidgetComposerVoiceToggleButton({
  editingMessageId,
  isRecordingVoice,
  loading,
  needsName,
  sending,
  sendingVoice,
  sessionId,
  onToggleVoiceRecording,
}: ChatWidgetComposerVoiceToggleButtonProps) {
  return (
    <button
      type="button"
      onClick={onToggleVoiceRecording}
      disabled={needsName || sending || sendingVoice || (!sessionId && !loading) || Boolean(editingMessageId)}
      className={`mb-1 rounded-2xl p-3 shadow-lg transition-all active:scale-95 ${
        isRecordingVoice
          ? "bg-red-500 text-white shadow-red-500/20"
          : "border border-sage-light/20 bg-white text-forest hover:bg-cream/60"
      } disabled:cursor-not-allowed disabled:opacity-30`}
      aria-label={isRecordingVoice ? "Р С›РЎРѓРЎвЂљР В°Р Р…Р С•Р Р†Р С‘РЎвЂљРЎРЉ Р В·Р В°Р С—Р С‘РЎРѓРЎРЉ" : "Р вЂ”Р В°Р С—Р С‘РЎРѓР В°РЎвЂљРЎРЉ Р С–Р С•Р В»Р С•РЎРѓР С•Р Р†Р С•Р Вµ"}
    >
      {sendingVoice ? <Loader2 className="h-5 w-5 animate-spin" /> : isRecordingVoice ? <Square className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
    </button>
  );
}
