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
  return (
    <textarea
      value={input}
      onChange={(event) => onInputChange(event.target.value)}
      onKeyDown={onKeyDown}
      placeholder={
        error && !sessionId
          ? "Сейчас чат недоступен. Попробуйте немного позже..."
          : "Напишите сообщение..."
      }
      disabled={needsName || (!sessionId && !loading)}
      rows={1}
      className="max-h-[120px] flex-1 resize-none bg-transparent px-4 py-3 text-sm text-forest outline-none placeholder:text-forest/30 disabled:opacity-50"
    />
  );
}
