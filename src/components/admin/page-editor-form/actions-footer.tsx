type PageEditorActionsFooterProps = {
  hasPageId: boolean;
  isSavingPage: boolean;
  onDelete: () => void;
  onReset: () => void;
  onSave: () => void;
};

export function PageEditorActionsFooter({
  hasPageId,
  isSavingPage,
  onDelete,
  onReset,
  onSave,
}: PageEditorActionsFooterProps) {
  return (
    <div className="mt-6 flex flex-wrap gap-3">
      <button
        type="button"
        onClick={onSave}
        disabled={isSavingPage}
        className="rounded-xl bg-sage px-5 py-3 text-sm font-semibold text-white transition hover:bg-sage-dark disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isSavingPage
          ? "\u0421\u043e\u0445\u0440\u0430\u043d\u044f\u044e..."
          : "\u0421\u043e\u0445\u0440\u0430\u043d\u0438\u0442\u044c \u043c\u0430\u0442\u0435\u0440\u0438\u0430\u043b"}
      </button>
      <button
        type="button"
        onClick={onReset}
        className="rounded-xl bg-cream px-5 py-3 text-sm font-semibold text-forest transition hover:bg-sage-light/20"
      >
        {"\u041e\u0447\u0438\u0441\u0442\u0438\u0442\u044c \u0444\u043e\u0440\u043c\u0443"}
      </button>
      {hasPageId ? (
        <button
          type="button"
          onClick={onDelete}
          className="rounded-xl bg-red-50 px-5 py-3 text-sm font-semibold text-red-700 transition hover:bg-red-100"
        >
          {"\u0423\u0434\u0430\u043b\u0438\u0442\u044c"}
        </button>
      ) : null}
    </div>
  );
}
