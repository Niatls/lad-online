import { X } from "lucide-react";

type ChatWidgetComposerErrorBannerProps = {
  error: string;
  onDismissError: () => void;
};

export function ChatWidgetComposerErrorBanner({
  error,
  onDismissError,
}: ChatWidgetComposerErrorBannerProps) {
  return (
    <div className="animate-in slide-in-from-bottom-2 absolute -top-10 left-4 right-4 flex items-center justify-between rounded-lg border border-red-100 bg-red-50 px-3 py-1.5 text-[11px] font-bold text-red-600">
      <span>{error}</span>
      <button onClick={onDismissError} className="rounded p-0.5 hover:bg-red-100">
        <X className="h-3 w-3" />
      </button>
    </div>
  );
}
