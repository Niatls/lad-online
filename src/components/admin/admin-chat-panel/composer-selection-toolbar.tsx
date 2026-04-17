import { Loader2, Trash2 } from "lucide-react";

type ComposerSelectionToolbarProps = {
  deletingMessages: boolean;
  selectedCount: number;
  onClearSelection: () => void;
  onDeleteMessages: () => void;
};

export function ComposerSelectionToolbar({
  deletingMessages,
  selectedCount,
  onClearSelection,
  onDeleteMessages,
}: ComposerSelectionToolbarProps) {
  if (selectedCount === 0) {
    return null;
  }

  return (
    <div className="mb-4 flex items-center justify-between gap-3 rounded-[1.5rem] border border-red-200 bg-red-50 px-4 py-3">
      <div>
        <p className="text-sm font-bold text-red-700">
          {"\u0412\u044b\u0431\u0440\u0430\u043d\u043e \u0441\u043e\u043e\u0431\u0449\u0435\u043d\u0438\u0439: "}
          {selectedCount}
        </p>
        <p className="text-xs text-red-600/80">
          {
            "\u0423\u0434\u0430\u043b\u0435\u043d\u0438\u0435 \u0441\u043a\u0440\u043e\u0435\u0442 \u0438\u0445 \u0438 \u0434\u043b\u044f \u043a\u043b\u0438\u0435\u043d\u0442\u0430 \u0442\u043e\u0436\u0435."
          }
        </p>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onClearSelection}
          className="rounded-2xl border border-red-200 bg-white px-3 py-2 text-xs font-bold text-red-600 transition hover:bg-red-100"
        >
          {"\u041e\u0442\u043c\u0435\u043d\u0430"}
        </button>
        <button
          type="button"
          onClick={onDeleteMessages}
          disabled={deletingMessages}
          className="inline-flex items-center gap-2 rounded-2xl bg-red-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-red-700 disabled:opacity-50"
        >
          {deletingMessages ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4" />
          )}
          {"\u0423\u0434\u0430\u043b\u0438\u0442\u044c"}
        </button>
      </div>
    </div>
  );
}
