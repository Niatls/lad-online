import type { VoiceEvent } from "./types";

type AdminVoiceEventsSidebarProps = {
  selectedId: number;
  selectedSessionName: string;
  voiceEvents: VoiceEvent[];
  formatTime: (date: string) => string;
  onRefresh: () => void;
};

export function AdminVoiceEventsSidebar({
  selectedId,
  selectedSessionName,
  voiceEvents,
  formatTime,
  onRefresh,
}: AdminVoiceEventsSidebarProps) {
  return (
    <aside className="hidden w-[360px] shrink-0 border-l border-sage-light/10 bg-white/70 xl:flex xl:flex-col">
      <div className="flex items-center justify-between gap-3 border-b border-sage-light/10 px-5 py-5">
        <div>
          <p className="text-sm font-bold text-forest">Voice-логи</p>
          <p className="text-xs text-forest/45">
            {selectedSessionName || `Посетитель #${selectedId}`} · последние события звонков
          </p>
        </div>
        <button
          type="button"
          onClick={onRefresh}
          className="rounded-2xl border border-sage-light/20 bg-white px-3 py-2 text-[11px] font-bold text-forest transition hover:bg-cream/40"
        >
          Обновить
        </button>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto bg-cream/10 px-5 py-5">
        {voiceEvents.length === 0 ? (
          <div className="rounded-[1.5rem] border border-dashed border-sage-light/20 bg-white/70 px-4 py-5 text-sm text-forest/45">
            Пока нет voice-событий для этого пользователя.
          </div>
        ) : (
          voiceEvents.map((event) => (
            <div key={event.id} className="rounded-[1.5rem] border border-sage-light/15 bg-white/80 px-4 py-4 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-bold text-forest">
                  {event.role === "admin" ? "Админ" : event.role === "visitor" ? "Пользователь" : "Система"}
                  {" · "}
                  {event.eventType}
                </p>
                <span className="text-[10px] font-bold text-forest/35">{formatTime(event.createdAt)}</span>
              </div>
              <p className="mt-1 text-sm text-forest/75">{event.message}</p>
              <p className="mt-2 break-all text-[10px] font-medium text-forest/35">{event.token}</p>
              {event.details ? (
                <pre className="mt-3 overflow-x-auto rounded-2xl bg-cream/50 px-3 py-3 text-[11px] leading-relaxed text-forest/65">
                  {JSON.stringify(event.details, null, 2)}
                </pre>
              ) : null}
            </div>
          ))
        )}
      </div>
    </aside>
  );
}
