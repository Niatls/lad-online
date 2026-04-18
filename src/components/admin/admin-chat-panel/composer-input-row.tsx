import { Loader2, Mic, Send, Square } from "lucide-react";

import { useCustomPasteContextMenu } from "@/components/ui/use-custom-paste-context-menu";
import { useExtensionOverlaySuppressor } from "@/components/ui/use-extension-overlay-suppressor";

type ComposerInputRowProps = {
  editingMessageId: number | null;
  input: string;
  isRecordingVoice: boolean;
  sending: boolean;
  sendingVoice: boolean;
  onInputChange: (value: string) => void;
  onKeyDown: (event: React.KeyboardEvent) => void;
  onSend: () => void;
  onToggleVoiceRecording: () => void;
};

export function ComposerInputRow({
  editingMessageId,
  input,
  isRecordingVoice,
  sending,
  sendingVoice,
  onInputChange,
  onKeyDown,
  onSend,
  onToggleVoiceRecording,
}: ComposerInputRowProps) {
  const { handleContextMenu, menu } = useCustomPasteContextMenu();
  const { handleBlur, handleFocus } = useExtensionOverlaySuppressor();

  return (
    <>
      <div className="flex items-end gap-3 rounded-[2rem] border border-sage-light/20 bg-cream/30 p-2 transition-all focus-within:border-forest/20 focus-within:ring-4 focus-within:ring-forest/5">
        <textarea
          value={input}
          autoComplete="off"
          spellCheck={false}
          data-1p-ignore="true"
          data-bwignore="true"
          data-form-type="other"
          data-gramm="false"
          data-gramm_editor="false"
          data-lt-active="false"
          data-lpignore="true"
          data-translation-ignore="true"
          data-translation-proxy="none"
          lang="zxx"
          translate="no"
          onBlur={handleBlur}
          onChange={(event) => onInputChange(event.target.value)}
          onContextMenu={handleContextMenu}
          onFocus={handleFocus}
          onKeyDown={onKeyDown}
          placeholder="Введите ваш ответ здесь..."
          rows={1}
          className="notranslate max-h-[150px] flex-1 resize-none bg-transparent px-5 py-3.5 text-sm text-forest outline-none placeholder:text-forest/30"
        />
        <button
          type="button"
          onClick={onToggleVoiceRecording}
          disabled={sending || sendingVoice || Boolean(editingMessageId)}
          className={`mb-1 flex items-center justify-center rounded-2xl p-3.5 transition-all active:scale-95 ${
            isRecordingVoice
              ? "bg-red-500 text-white shadow-xl shadow-red-500/20"
              : "border border-sage-light/20 bg-white text-forest hover:bg-cream/40"
          } disabled:cursor-not-allowed disabled:opacity-30`}
        >
          {sendingVoice ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : isRecordingVoice ? (
            <Square className="h-5 w-5" />
          ) : (
            <Mic className="h-5 w-5" />
          )}
        </button>
        <button
          onClick={onSend}
          disabled={!input.trim() || sending}
          className="mb-1 flex items-center justify-center rounded-2xl bg-forest p-3.5 text-white shadow-xl shadow-forest/20 transition-all hover:bg-forest/90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-30"
        >
          {sending ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Send className="h-5 w-5" />
          )}
        </button>
      </div>
      {menu}
    </>
  );
}
