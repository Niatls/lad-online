import { Loader2, Mic, Phone, Send, Square, X } from "lucide-react";

import type { Message, VoiceInvite } from "@/components/chat/chat-widget/types";

type ChatWidgetComposerProps = {
  error: string | null;
  sessionId: number | null;
  availableVoiceInvite: VoiceInvite | null;
  activeVoiceToken: string | null;
  voiceExpiresIn: string | null;
  replyTarget: Message | null;
  editingMessageId: number | null;
  input: string;
  loading: boolean;
  needsName: boolean;
  sending: boolean;
  sendingVoice: boolean;
  isRecordingVoice: boolean;
  recordingStartedAt: number | null;
  getMessagePreview: (message: Message) => string;
  onDismissError: () => void;
  onJoinVoice: (token: string) => void;
  onClearReply: () => void;
  onCancelEditing: () => void;
  onInputChange: (value: string) => void;
  onKeyDown: (event: React.KeyboardEvent) => void;
  onToggleVoiceRecording: () => void;
  onSend: () => void;
};

export function ChatWidgetComposer({
  error,
  sessionId,
  availableVoiceInvite,
  activeVoiceToken,
  voiceExpiresIn,
  replyTarget,
  editingMessageId,
  input,
  loading,
  needsName,
  sending,
  sendingVoice,
  isRecordingVoice,
  recordingStartedAt,
  getMessagePreview,
  onDismissError,
  onJoinVoice,
  onClearReply,
  onCancelEditing,
  onInputChange,
  onKeyDown,
  onToggleVoiceRecording,
  onSend,
}: ChatWidgetComposerProps) {
  return (
    <div className="shrink-0 p-4 bg-white relative">
      {error && sessionId ? (
        <div className="absolute -top-10 left-4 right-4 bg-red-50 text-red-600 text-[11px] font-bold px-3 py-1.5 rounded-lg border border-red-100 flex items-center justify-between animate-in slide-in-from-bottom-2">
          <span>{error}</span>
          <button onClick={onDismissError} className="p-0.5 hover:bg-red-100 rounded">
            <X className="h-3 w-3" />
          </button>
        </div>
      ) : null}

      {availableVoiceInvite && !activeVoiceToken ? (
        <button
          type="button"
          onClick={() => onJoinVoice(availableVoiceInvite.token)}
          className="mb-3 w-full rounded-[1.5rem] border border-sage-light/20 bg-forest px-4 py-3 text-left text-white shadow-lg shadow-forest/15 transition hover:bg-forest/90"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-white/12 flex items-center justify-center">
                <Phone className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-bold">Голосовое общение</p>
                <p className="text-[11px] text-white/70">Кнопка доступна ещё {voiceExpiresIn}</p>
              </div>
            </div>
            <span className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em]">voice</span>
          </div>
        </button>
      ) : null}

      {replyTarget ? (
        <div className="mb-3 rounded-[1.25rem] border border-sage-light/20 bg-cream/35 px-4 py-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-forest/35">Ответ</p>
              <p className="mt-1 text-xs font-bold text-forest">
                {replyTarget.sender === "visitor" ? "Вы" : replyTarget.sender === "admin" ? "Поддержка" : "Система"}
              </p>
              <p className="mt-1 truncate text-xs text-forest/55">{getMessagePreview(replyTarget)}</p>
            </div>
            <button type="button" onClick={onClearReply} className="rounded-full p-1 text-forest/35 hover:bg-white/70 hover:text-forest">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : null}

      {editingMessageId ? (
        <div className="mb-3 rounded-[1.25rem] border border-sage-light/20 bg-cream/35 px-4 py-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-forest/35">Редактирование</p>
              <p className="mt-1 text-xs text-forest/55">Измените текст и отправьте повторно.</p>
            </div>
            <button
              type="button"
              onClick={onCancelEditing}
              className="rounded-full p-1 text-forest/35 hover:bg-white/70 hover:text-forest"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : null}

      <div className="p-2 rounded-[1.75rem] bg-cream/30 border border-sage-light/20 flex items-end gap-2 focus-within:border-forest/20 focus-within:ring-4 focus-within:ring-forest/5 transition-all">
        <textarea
          value={input}
          onChange={(event) => onInputChange(event.target.value)}
          onKeyDown={onKeyDown}
          placeholder={error && !sessionId ? "Чат недоступен..." : "Ваше сообщение..."}
          disabled={needsName || (!sessionId && !loading)}
          rows={1}
          className="flex-1 resize-none bg-transparent px-4 py-3 text-sm text-forest placeholder:text-forest/30 outline-none max-h-[120px] disabled:opacity-50"
        />
        <button
          type="button"
          onClick={onToggleVoiceRecording}
          disabled={needsName || sending || sendingVoice || (!sessionId && !loading) || Boolean(editingMessageId)}
          className={`mb-1 p-3 rounded-2xl transition-all shadow-lg active:scale-95 ${
            isRecordingVoice
              ? "bg-red-500 text-white shadow-red-500/20"
              : "bg-white text-forest border border-sage-light/20 hover:bg-cream/60"
          } disabled:opacity-30 disabled:cursor-not-allowed`}
          aria-label={isRecordingVoice ? "Остановить запись" : "Записать голосовое"}
        >
          {sendingVoice ? <Loader2 className="h-5 w-5 animate-spin" /> : isRecordingVoice ? <Square className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
        </button>
        <button
          onClick={onSend}
          disabled={needsName || !input.trim() || sending || (!sessionId && !loading)}
          className="mb-1 p-3 rounded-2xl bg-forest text-white hover:bg-forest/90 transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-lg shadow-forest/20 active:scale-95"
        >
          {sending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
        </button>
      </div>
      {isRecordingVoice ? (
        <p className="mt-2 text-[11px] text-center font-bold text-red-500">
          Идёт запись. Нажмите квадрат, чтобы отправить голосовое.
        </p>
      ) : recordingStartedAt ? (
        <p className="mt-2 text-[11px] text-center text-forest/40">
          Начало записи: {new Date(recordingStartedAt).toLocaleTimeString("ru", { hour: "2-digit", minute: "2-digit" })}
        </p>
      ) : null}
      <p className="text-[10px] text-center text-forest/30 mt-3 font-medium tracking-wide uppercase">
        Безопасный чат • Лад
      </p>
    </div>
  );
}
