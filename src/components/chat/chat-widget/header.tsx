import { User, X } from "lucide-react";

type ChatWidgetHeaderProps = {
  onClose: () => void;
};

export function ChatWidgetHeader({ onClose }: ChatWidgetHeaderProps) {
  return (
    <div className="relative shrink-0 select-none overflow-hidden bg-forest p-6 text-white">
      <div className="absolute -right-24 -top-24 h-48 w-48 rounded-full bg-sage-light/10 blur-3xl" />

      <div className="relative flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md">
              <User className="h-6 w-6 text-white" />
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-forest bg-green-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold tracking-tight">Поддержка Лад</h3>
            <div className="flex items-center gap-1.5 text-xs text-white/70">
              <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-400" />
              Онлайн
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          onContextMenu={(event) => event.preventDefault()}
          className="rounded-2xl border border-white/10 bg-white/10 p-2 transition-all hover:bg-white/20"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
