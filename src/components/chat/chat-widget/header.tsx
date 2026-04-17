import { User, X } from "lucide-react";

type ChatWidgetHeaderProps = {
  onClose: () => void;
};

export function ChatWidgetHeader({ onClose }: ChatWidgetHeaderProps) {
  return (
    <div className="relative shrink-0 overflow-hidden bg-forest p-6 text-white">
      <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-sage-light/10 blur-3xl" />

      <div className="relative flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
              <User className="h-6 w-6 text-white" />
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-green-400 border-2 border-forest" />
          </div>
          <div>
            <h3 className="font-bold text-lg tracking-tight">Поддержка Лад</h3>
            <div className="flex items-center gap-1.5 text-white/70 text-xs">
              <div className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
              Онлайн
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-2xl bg-white/10 hover:bg-white/20 transition-all border border-white/10"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
