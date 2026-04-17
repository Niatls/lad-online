import { Loader2, Mic, Phone, Send, Square, Trash2, X } from "lucide-react";

import type { Message, Session } from "@/components/admin/admin-chat-panel/types";

type AdminChatComposerProps = {
  selectedMessageIds: number[];
  deletingMessages: boolean;
  creatingVoiceToken: boolean;
  replyTarget: Message | null;
  editingMessageId: number | null;
  input: string;
  sending: boolean;
  sendingVoice: boolean;
  isRecordingVoice: boolean;
  recordingStartedAt: number | null;
  selectedSession: Session | null;
  getMessagePreview: (message: Message) => string;
  formatTime: (date: string) => string;
  onClearSelection: () => void;
  onDeleteMessages: () => void;
  onGenerateVoiceToken: () => void;
  onClearReply: () => void;
  onCancelEditing: () => void;
  onInputChange: (value: string) => void;
  onKeyDown: (event: React.KeyboardEvent) => void;
  onToggleVoiceRecording: () => void;
  onSend: () => void;
};

export function AdminChatComposer({
  selectedMessageIds,
  deletingMessages,
  creatingVoiceToken,
  replyTarget,
  editingMessageId,
  input,
  sending,
  sendingVoice,
  isRecordingVoice,
  recordingStartedAt,
  selectedSession,
  getMessagePreview,
  formatTime,
  onClearSelection,
  onDeleteMessages,
  onGenerateVoiceToken,
  onClearReply,
  onCancelEditing,
  onInputChange,
  onKeyDown,
  onToggleVoiceRecording,
  onSend,
}: AdminChatComposerProps) {
  return (
    <div className="shrink-0 p-6 bg-white/60 backdrop-blur-md border-t border-sage-light/10">
      {selectedMessageIds.length > 0 ? (
        <div className="mb-4 flex items-center justify-between gap-3 rounded-[1.5rem] border border-red-200 bg-red-50 px-4 py-3">
          <div>
            <p className="text-sm font-bold text-red-700">Выбрано сообщений: {selectedMessageIds.length}</p>
            <p className="text-xs text-red-600/80">Удаление скроет их и для клиента тоже.</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClearSelection}
              className="rounded-2xl border border-red-200 bg-white px-3 py-2 text-xs font-bold text-red-600 transition hover:bg-red-100"
            >
              Отмена
            </button>
            <button
              type="button"
              onClick={onDeleteMessages}
              disabled={deletingMessages}
              className="inline-flex items-center gap-2 rounded-2xl bg-red-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-red-700 disabled:opacity-50"
            >
              {deletingMessages ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              Удалить
            </button>
          </div>
        </div>
      ) : null}

      <div className="mb-4 flex items-center justify-between gap-3 rounded-[1.5rem] border border-sage-light/15 bg-cream/35 px-4 py-3">
        <div>
          <p className="text-sm font-bold text-forest">Voice-режим</p>
          <p className="text-xs text-forest/50">
            Запустите голосовое общение для выбранного пользователя. Кнопка у клиента будет доступна 5 минут.
          </p>
        </div>
        <button
          type="button"
          onClick={onGenerateVoiceToken}
          disabled={creatingVoiceToken}
          className="inline-flex items-center gap-2 rounded-2xl bg-forest px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-forest/15 transition hover:bg-forest/90 disabled:opacity-50"
        >
          {creatingVoiceToken ? <Loader2 className="h-4 w-4 animate-spin" /> : <Phone className="h-4 w-4" />}
          Позвонить пользователю
        </button>
      </div>

      {replyTarget ? (
        <div className="mb-4 rounded-[1.5rem] border border-sage-light/20 bg-cream/35 px-4 py-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-forest/35">Ответ</p>
              <p className="mt-1 text-xs font-bold text-forest">
                {replyTarget.sender === "admin"
                  ? "Вы"
                  : replyTarget.sender === "visitor"
                    ? (selectedSession?.visitorName || "Пользователь")
                    : "Система"}
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
        <div className="mb-4 rounded-[1.5rem] border border-sage-light/20 bg-cream/35 px-4 py-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-forest/35">Редактирование</p>
              <p className="mt-1 text-xs text-forest/55">Измените текст и отправьте сообщение ещё раз.</p>
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

      <div className="flex items-end gap-3 p-2 rounded-[2rem] bg-cream/30 border border-sage-light/20 focus-within:border-forest/20 focus-within:ring-4 focus-within:ring-forest/5 transition-all">
        <textarea
          value={input}
          onChange={(event) => onInputChange(event.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Введите ваш ответ здесь..."
          rows={1}
          className="flex-1 resize-none bg-transparent px-5 py-3.5 text-sm text-forest placeholder:text-forest/30 outline-none max-h-[150px]"
        />
        <button
          type="button"
          onClick={onToggleVoiceRecording}
          disabled={sending || sendingVoice || Boolean(editingMessageId)}
          className={`mb-1 flex items-center justify-center rounded-2xl p-3.5 transition-all active:scale-95 ${
            isRecordingVoice
              ? "bg-red-500 text-white shadow-xl shadow-red-500/20"
              : "border border-sage-light/20 bg-white text-forest hover:bg-cream/40"
          } disabled:cursor-not-allowed disabled:opacity-30`}
        >
          {sendingVoice ? <Loader2 className="h-5 w-5 animate-spin" /> : isRecordingVoice ? <Square className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
        </button>
        <button
          onClick={onSend}
          disabled={!input.trim() || sending}
          className="mb-1 p-3.5 rounded-2xl bg-forest text-white hover:bg-forest/90 transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-xl shadow-forest/20 active:scale-95 flex items-center justify-center"
        >
          {sending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
        </button>
      </div>
      {isRecordingVoice ? (
        <p className="mt-3 text-[11px] font-bold text-red-500">
          Запись идёт. Нажмите квадрат, чтобы отправить голосовое сообщение.
        </p>
      ) : recordingStartedAt ? (
        <p className="mt-3 text-[11px] text-forest/40">
          Начало записи: {formatTime(new Date(recordingStartedAt).toISOString())}
        </p>
      ) : null}
    </div>
  );
}
