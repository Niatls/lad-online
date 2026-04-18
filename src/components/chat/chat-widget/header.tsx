import { User, X } from "lucide-react";

type ChatWidgetHeaderProps = {
  canClose?: boolean;
  onClose: () => void;
};

export function ChatWidgetHeader({
  canClose = true,
  onClose,
}: ChatWidgetHeaderProps) {
  return (
    <div className="relative shrink-0 select-none overflow-hidden bg-forest px-4 py-3.5 text-white sm:p-6">
      <div className="absolute -right-24 -top-24 h-48 w-48 rounded-full bg-sage-light/10 blur-3xl" />

      <div className="relative flex items-center justify-between">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="relative">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md sm:h-12 sm:w-12">
              <User className="h-5 w-5 text-white sm:h-6 sm:w-6" />
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-forest bg-green-400 sm:h-3.5 sm:w-3.5" />
          </div>
          <div>
            <h3 className="text-base font-bold tracking-tight sm:text-lg">
              {"\u041f\u043e\u0434\u0434\u0435\u0440\u0436\u043a\u0430 \u041b\u0430\u0434"}
            </h3>
            <div className="flex items-center gap-1.5 text-[11px] text-white/70 sm:text-xs">
              <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-400" />
              {"\u041e\u043d\u043b\u0430\u0439\u043d"}
            </div>
          </div>
        </div>
        {canClose ? (
          <button
            onClick={onClose}
            onContextMenu={(event) => event.preventDefault()}
            className="rounded-2xl border border-white/10 bg-white/10 p-2 transition-all hover:bg-white/20"
          >
            <X className="h-5 w-5" />
          </button>
        ) : null}
      </div>
    </div>
  );
}
