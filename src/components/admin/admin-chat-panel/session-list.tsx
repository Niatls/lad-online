import { Loader2, MessageCircle, User } from "lucide-react";

import { formatUsage } from "@/components/admin/admin-chat-panel/utils";
import type { Session, VoiceLiveStats, UsageSummary } from "@/components/admin/admin-chat-panel/types";
import { getChatMessagePreviewText } from "@/lib/chat-message-format";

type AdminChatSessionListProps = {
  loading: boolean;
  sessions: Session[];
  selectedId: number | null;
  usage: UsageSummary;
  activeVoiceStats: VoiceLiveStats | null;
  displayedUsageBytes: number;
  displayedUsagePercent: string;
  formatTime: (date: string) => string;
  onSelectSession: (sessionId: number) => void;
  onOpenSessionContextMenu: (sessionId: number, x: number, y: number) => void;
};

export function AdminChatSessionList({
  loading,
  sessions,
  selectedId,
  usage,
  activeVoiceStats,
  displayedUsageBytes,
  displayedUsagePercent,
  formatTime,
  onSelectSession,
  onOpenSessionContextMenu,
}: AdminChatSessionListProps) {
  return (
    <div className={`w-96 border-r border-sage-light/10 flex flex-col shrink-0 ${selectedId ? "hidden md:flex" : "flex w-full md:w-96"}`}>
      <div className="p-6 border-b border-sage-light/10 bg-white/40">
        <h2 className="text-xl font-bold text-forest flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-sage/10 flex items-center justify-center">
            <MessageCircle className="h-5 w-5 text-sage" />
          </div>
          Чаты
        </h2>
        <div className="flex items-center gap-2 mt-2">
          <span className="h-2 w-2 rounded-full bg-green-400" />
          <p className="text-[10px] font-bold text-forest/40 uppercase tracking-wider">{sessions.length} активных диалогов</p>
        </div>
        <div className="mt-3 rounded-[1.25rem] border border-sage-light/15 bg-cream/35 px-4 py-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-forest/35">Лимит voice за месяц</p>
          <p className="mt-1 text-base font-bold text-forest">{formatUsage(displayedUsageBytes)} / {formatUsage(usage.monthlyCapBytes)}</p>
          <p className="mt-1 text-[11px] text-forest/45">{displayedUsagePercent}% от лимита · {usage.inviteCount} звонков</p>
          {activeVoiceStats?.liveServerBytes ? (
            <p className="mt-1 text-[11px] font-medium text-sage">
              +{formatUsage(activeVoiceStats.liveServerBytes)} в лайве · {activeVoiceStats.trafficRouteLabel}
            </p>
          ) : null}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1 bg-cream/5">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-sage/40" />
            <p className="text-forest/30 text-xs font-medium uppercase tracking-widest">Загрузка...</p>
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-24 px-8">
            <div className="w-16 h-16 rounded-[1.5rem] bg-sage/5 flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="h-8 w-8 text-sage/20" />
            </div>
            <p className="text-forest/30 text-sm font-medium">Нет активных диалогов</p>
          </div>
        ) : (
          sessions.map((session) => {
            const lastMsg = session.messages?.[0];
            const isActive = session.id === selectedId;

            return (
              <button
                key={session.id}
                onClick={() => onSelectSession(session.id)}
                onContextMenu={(event) => {
                  event.preventDefault();
                  onOpenSessionContextMenu(session.id, event.clientX, event.clientY);
                }}
                className={`w-full text-left px-4 py-4 rounded-[1.5rem] transition-all duration-300 relative group overflow-hidden ${
                  isActive ? "bg-forest text-white shadow-xl shadow-forest/20" : "hover:bg-sage-light/10"
                }`}
              >
                <div className="flex items-center gap-4 relative z-10">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border transition-colors ${
                    isActive ? "bg-white/10 border-white/20" : "bg-white border-sage-light/20 shadow-sm"
                  }`}>
                    <User className={`h-5 w-5 ${isActive ? "text-white" : "text-sage"}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-0.5">
                      <span className={`font-bold text-sm truncate ${isActive ? "text-white" : "text-forest"}`}>
                        {session.visitorName || `Посетитель #${session.id}`}
                      </span>
                      <span className={`text-[10px] font-medium ml-2 shrink-0 ${isActive ? "text-white/50" : "text-forest/30"}`}>
                        {formatTime(session.updatedAt)}
                      </span>
                    </div>
                    <p className={`text-xs truncate ${isActive ? "text-white/70" : "text-forest/50"}`}>
                      {lastMsg
                        ? (lastMsg.sender === "admin" ? "Вы: " : "") + (getChatMessagePreviewText(lastMsg.content) ?? "Системное сообщение")
                        : "Новый диалог"}
                    </p>
                  </div>
                  {session._count.messages > 0 && !isActive ? (
                    <span className="h-2 w-2 rounded-full bg-sage ring-4 ring-sage/10 shrink-0" />
                  ) : null}
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
