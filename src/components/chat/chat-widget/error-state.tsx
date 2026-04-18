import { Loader2, X } from "lucide-react";

type ChatWidgetErrorStateProps = {
  error: string;
  loading: boolean;
  onRetry: () => void;
};

export function ChatWidgetErrorState({ error, loading, onRetry }: ChatWidgetErrorStateProps) {
  return (
    <div className="flex h-full flex-col items-center justify-center px-6 py-12 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
        <X className="h-8 w-8 text-red-500/50" />
      </div>
      <p className="mb-4 text-sm font-medium text-forest/70">{error}</p>
      <button
        onClick={onRetry}
        className="mx-auto flex items-center gap-2 rounded-xl bg-forest px-6 py-2 text-sm font-bold text-white shadow-lg transition-all hover:bg-forest/90 active:scale-95"
      >
        <Loader2 className={`h-3.5 w-3.5 animate-spin ${loading ? "block" : "hidden"}`} />
        Попробовать снова
      </button>
    </div>
  );
}
