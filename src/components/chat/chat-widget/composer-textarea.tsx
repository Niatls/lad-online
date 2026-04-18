import { useCustomPasteContextMenu } from "@/components/ui/use-custom-paste-context-menu";

type ChatWidgetComposerTextareaProps = {
  error: string | null;
  input: string;
  loading: boolean;
  needsName: boolean;
  sessionId: number | null;
  onInputChange: (value: string) => void;
  onKeyDown: (event: React.KeyboardEvent) => void;
};

export function ChatWidgetComposerTextarea({
  error,
  input,
  loading,
  needsName,
  sessionId,
  onInputChange,
  onKeyDown,
}: ChatWidgetComposerTextareaProps) {
  const { handleContextMenu, menu } = useCustomPasteContextMenu();

  return (
    <>
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
        onChange={(event) => onInputChange(event.target.value)}
        onKeyDown={onKeyDown}
        onContextMenu={handleContextMenu}
        translate="no"
        placeholder={
          error && !sessionId
            ? "Сейчас чат недоступен. Попробуйте немного позже..."
            : "Напишите сообщение..."
        }
        disabled={needsName || (!sessionId && !loading)}
        rows={1}
        className="notranslate max-h-[120px] flex-1 resize-none bg-transparent px-4 py-3 text-sm text-forest outline-none placeholder:text-forest/30 disabled:opacity-50"
      />
      {menu}
    </>
  );
}
