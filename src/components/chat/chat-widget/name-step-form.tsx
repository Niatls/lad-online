type ChatWidgetNameStepFormProps = {
  pendingVisitorName: string;
  loading: boolean;
  onChangeName: (value: string) => void;
  onSaveName: () => void;
};

export function ChatWidgetNameStepForm({
  pendingVisitorName,
  loading,
  onChangeName,
  onSaveName,
}: ChatWidgetNameStepFormProps) {
  return (
    <div className="w-full max-w-[280px] space-y-3">
      <input
        value={pendingVisitorName}
        onChange={(event) => onChangeName(event.target.value)}
        placeholder="Имя или псевдоним"
        className="w-full rounded-2xl border border-sage-light/20 bg-white px-4 py-3 text-sm text-forest outline-none focus:border-forest/30"
      />
      <button
        type="button"
        onClick={onSaveName}
        disabled={!pendingVisitorName.trim() || loading}
        className="w-full rounded-2xl bg-forest px-4 py-3 text-sm font-bold text-white shadow-lg shadow-forest/15 transition hover:bg-forest/90 disabled:opacity-50"
      >
        {loading ? "Подключаем..." : "Продолжить"}
      </button>
    </div>
  );
}
