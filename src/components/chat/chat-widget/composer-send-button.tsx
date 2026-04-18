import { Loader2, Send } from "lucide-react";

type ChatWidgetComposerSendButtonProps = {
  input: string;
  loading: boolean;
  needsName: boolean;
  sending: boolean;
  sessionId: number | null;
  onSend: () => void;
};

export function ChatWidgetComposerSendButton({
  input,
  loading,
  needsName,
  sending,
  sessionId,
  onSend,
}: ChatWidgetComposerSendButtonProps) {
  return (
    <button
      onClick={onSend}
      disabled={needsName || !input.trim() || sending || (!sessionId && !loading)}
      className="mb-1 rounded-2xl bg-forest p-3 text-white shadow-lg shadow-forest/20 transition-all active:scale-95 hover:bg-forest/90 disabled:cursor-not-allowed disabled:opacity-30"
    >
      {sending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
    </button>
  );
}
