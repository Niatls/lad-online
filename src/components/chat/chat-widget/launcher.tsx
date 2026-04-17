import { MessageCircle } from "lucide-react";

type ChatWidgetLauncherProps = {
  hasUnread: boolean;
  onOpen: () => void;
};

export function ChatWidgetLauncher({ hasUnread, onOpen }: ChatWidgetLauncherProps) {
  return (
    <button
      onClick={onOpen}
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full bg-gradient-to-br from-forest to-forest-light px-6 py-4 text-white shadow-[0_20px_50px_rgba(45,63,45,0.3)] transition-all hover:shadow-[0_20px_60px_rgba(45,63,45,0.4)] hover:-translate-y-1 active:scale-95 active:translate-y-0 group border border-white/10"
    >
      <div className="relative">
        <MessageCircle className="h-6 w-6 transition-transform group-hover:scale-110" />
        {hasUnread ? (
          <span className="absolute -top-1.5 -right-1.5 h-3.5 w-3.5 rounded-full bg-red-500 border-2 border-forest ring-2 ring-red-500/30 animate-pulse" />
        ) : null}
      </div>
      <span className="text-sm font-bold tracking-tight hidden sm:inline">Задать вопрос</span>
    </button>
  );
}
