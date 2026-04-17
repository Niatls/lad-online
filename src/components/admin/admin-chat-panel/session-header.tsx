import { Archive, ArrowLeft, Clock, Loader2, Trash2, User } from "lucide-react";

type AdminChatSessionHeaderProps = {
  selectedId: number;
  selectedSessionName: string;
  createdAt: string;
  archivingSession: boolean;
  deletingSession: boolean;
  formatTime: (date: string) => string;
  onBack: () => void;
  onArchive: () => void;
  onDelete: () => void;
};

export function AdminChatSessionHeader({
  selectedId,
  selectedSessionName,
  createdAt,
  archivingSession,
  deletingSession,
  formatTime,
  onBack,
  onArchive,
  onDelete,
}: AdminChatSessionHeaderProps) {
  return (
    <div className="flex items-center justify-between gap-4 px-8 py-6 border-b border-sage-light/10 bg-white/60 backdrop-blur-md shrink-0">
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
      <div className="flex items-center gap-2 flex-wrap justify-end">
        <button
          type="button"
          onClick={onArchive}
          disabled={archivingSession}
          className="inline-flex items-center gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-xs font-bold text-amber-700 transition hover:bg-amber-100 disabled:opacity-50"
        >
          {archivingSession ? <Loader2 className="h-4 w-4 animate-spin" /> : <Archive className="h-4 w-4" />}
          Скрыть
        </button>
        <button
          type="button"
          onClick={onDelete}
          disabled={deletingSession}
          className="inline-flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-2.5 text-xs font-bold text-red-600 transition hover:bg-red-100 disabled:opacity-50"
        >
          {deletingSession ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
          Удалить навсегда
        </button>
      </div>
    </div>
  );
}
