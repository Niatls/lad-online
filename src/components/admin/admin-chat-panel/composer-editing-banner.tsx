import { X } from "lucide-react";

type ComposerEditingBannerProps = {
  editingMessageId: number | null;
  onCancelEditing: () => void;
};

export function ComposerEditingBanner({
  editingMessageId,
  onCancelEditing,
}: ComposerEditingBannerProps) {
  if (!editingMessageId) {
    return null;
  }

  return (
    <div className="mb-4 rounded-[1.5rem] border border-sage-light/20 bg-cream/35 px-4 py-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-forest/35">
            {"\u0420\u0435\u0434\u0430\u043a\u0442\u0438\u0440\u043e\u0432\u0430\u043d\u0438\u0435"}
          </p>
          <p className="mt-1 text-xs text-forest/55">
            {
              "\u0418\u0437\u043c\u0435\u043d\u0438\u0442\u0435 \u0442\u0435\u043a\u0441\u0442 \u0438 \u043e\u0442\u043f\u0440\u0430\u0432\u044c\u0442\u0435 \u0441\u043e\u043e\u0431\u0449\u0435\u043d\u0438\u0435 \u0435\u0449\u0451 \u0440\u0430\u0437."
            }
          </p>
        </div>
        <button
          type="button"
          onClick={onCancelEditing}
          className="rounded-full p-1 text-forest/35 hover:bg-white/70 hover:text-forest"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
