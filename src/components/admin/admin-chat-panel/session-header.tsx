import type { MouseEvent } from "react";
import { ArrowLeft, Clock, User } from "lucide-react";

type AdminChatSessionHeaderProps = {
  selectedId: number;
  selectedSessionName: string;
  createdAt: string;
  formatTime: (date: string) => string;
  onBack: () => void;
  onOpenContextMenu: (event: MouseEvent<HTMLDivElement>) => void;
};

export function AdminChatSessionHeader({
  selectedId,
  selectedSessionName,
  createdAt,
  formatTime,
  onBack,
  onOpenContextMenu,
}: AdminChatSessionHeaderProps) {
  return (
    <div
      className="flex items-center justify-between gap-4 px-8 py-6 border-b border-sage-light/10 bg-white/60 backdrop-blur-md shrink-0"
      onContextMenu={onOpenContextMenu}
    >
      <div className="flex items-center gap-4 min-w-0">
        <button
          onClick={onBack}
          className="md:hidden p-2 rounded-2xl hover:bg-sage-light/20 text-forest/60 transition-all border border-sage-light/10"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="w-12 h-12 rounded-2xl bg-sage/10 flex items-center justify-center border border-sage-light/20">
          <User className="h-6 w-6 text-sage" />
        </div>
        <div className="min-w-0">
          <h4 className="font-bold text-lg text-forest tracking-tight truncate">
            {selectedSessionName || `Посетитель #${selectedId}`}
          </h4>
          <div className="flex items-center gap-3 mt-0.5 flex-wrap">
            <p className="text-[10px] uppercase font-bold tracking-widest text-forest/30 flex items-center gap-1.5">
              <Clock className="h-3 w-3" />
              Первый визит: {formatTime(createdAt)}
            </p>
            <div className="h-1 w-1 rounded-full bg-forest/10" />
            <p className="text-[10px] uppercase font-bold tracking-widest text-green-500 flex items-center gap-1">
              <span className="h-1 w-1 rounded-full bg-green-500 animate-ping" />
              Активен
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
