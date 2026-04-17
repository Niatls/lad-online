import { CheckCircle, Loader2 } from "lucide-react";

import type { SaveStatus } from "./use-live-palette-save";

type LivePaletteSaveFooterProps = {
  isSaving: boolean;
  onSave: () => void;
  saveStatus: SaveStatus;
};

export function LivePaletteSaveFooter({
  isSaving,
  onSave,
  saveStatus,
}: LivePaletteSaveFooterProps) {
  return (
    <div className="mt-auto border-t border-sage-light/20 bg-cream/30 p-4">
      <p className="mb-4 text-xs leading-relaxed text-forest/60">
        {
          "\u041f\u0435\u0440\u0435\u0442\u0430\u0449\u0438\u0442\u0435 \u041f\u0443\u0441\u0442\u043e\u0439 \u0431\u043b\u043e\u043a \u043d\u0430 \u0441\u0442\u0440\u0430\u043d\u0438\u0446\u0443. \u0417\u0430\u0442\u0435\u043c \u043f\u0435\u0440\u0435\u0442\u0430\u0441\u043a\u0438\u0432\u0430\u0439\u0442\u0435 \u0432 \u043d\u0435\u0433\u043e \u042d\u043b\u0435\u043c\u0435\u043d\u0442\u044b!"
        }
      </p>
      <button
        type="button"
        onClick={onSave}
        disabled={isSaving}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-forest px-4 py-3 text-sm font-semibold text-white transition hover:bg-forest/90 disabled:opacity-50"
      >
        {isSaving ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : saveStatus === "success" ? (
          <>
            <CheckCircle className="h-4 w-4" />
            {"\u0421\u043e\u0445\u0440\u0430\u043d\u0435\u043d\u043e"}
          </>
        ) : (
          "\u041e\u043f\u0443\u0431\u043b\u0438\u043a\u043e\u0432\u0430\u0442\u044c"
        )}
      </button>
      {saveStatus === "error" ? (
        <p className="mt-2 text-center text-xs font-medium text-red-500">
          {"\u041e\u0448\u0438\u0431\u043a\u0430 \u0441\u043e\u0445\u0440\u0430\u043d\u0435\u043d\u0438\u044f"}
        </p>
      ) : null}
    </div>
  );
}
