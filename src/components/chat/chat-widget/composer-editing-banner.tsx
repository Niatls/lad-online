import { X } from "lucide-react";

type ChatWidgetComposerEditingBannerProps = {
  onCancelEditing: () => void;
};

export function ChatWidgetComposerEditingBanner({
  onCancelEditing,
}: ChatWidgetComposerEditingBannerProps) {
  return (
    <div className="mb-3 rounded-[1.25rem] border border-sage-light/20 bg-cream/35 px-4 py-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-forest/35">
            Редактирование
          </p>
          <p className="mt-1 text-xs text-forest/55">
            Измените текст и отправьте повторно.
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
