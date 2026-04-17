import { Loader2, Mic, Send, Square, X } from "lucide-react";

import { ChatWidgetComposerErrorBanner } from "@/components/chat/chat-widget/composer-error-banner";
import { ChatWidgetComposerReplyBanner } from "@/components/chat/chat-widget/composer-reply-banner";
import { ChatWidgetComposerVoiceInvite } from "@/components/chat/chat-widget/composer-voice-invite";
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
    <div className="relative shrink-0 bg-white p-4">
      {error && sessionId ? (
        <ChatWidgetComposerErrorBanner
          error={error}
          onDismissError={onDismissError}
        />
      ) : null}

      {availableVoiceInvite && !activeVoiceToken ? (
        <ChatWidgetComposerVoiceInvite
          availableVoiceInvite={availableVoiceInvite}
          voiceExpiresIn={voiceExpiresIn}
          onJoinVoice={onJoinVoice}
        />
      ) : null}

      {replyTarget ? (
        <ChatWidgetComposerReplyBanner
          replyTarget={replyTarget}
          getMessagePreview={getMessagePreview}
          onClearReply={onClearReply}
        />
      ) : null}

      {editingMessageId ? (
        <div className="mb-3 rounded-[1.25rem] border border-sage-light/20 bg-cream/35 px-4 py-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-forest/35">Р РµРґР°РєС‚РёСЂРѕРІР°РЅРёРµ</p>
              <p className="mt-1 text-xs text-forest/55">РР·РјРµРЅРёС‚Рµ С‚РµРєСЃС‚ Рё РѕС‚РїСЂР°РІСЊС‚Рµ РїРѕРІС‚РѕСЂРЅРѕ.</p>
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

      <div className="flex items-end gap-2 rounded-[1.75rem] border border-sage-light/20 bg-cream/30 p-2 transition-all focus-within:border-forest/20 focus-within:ring-4 focus-within:ring-forest/5">
        <textarea
          value={input}
          onChange={(event) => onInputChange(event.target.value)}
          onKeyDown={onKeyDown}
          placeholder={error && !sessionId ? "Р§Р°С‚ РЅРµРґРѕСЃС‚СѓРїРµРЅ..." : "Р’Р°С€Рµ СЃРѕРѕР±С‰РµРЅРёРµ..."}
          disabled={needsName || (!sessionId && !loading)}
          rows={1}
          className="max-h-[120px] flex-1 resize-none bg-transparent px-4 py-3 text-sm text-forest outline-none placeholder:text-forest/30 disabled:opacity-50"
        />
        <button
          type="button"
          onClick={onToggleVoiceRecording}
          disabled={needsName || sending || sendingVoice || (!sessionId && !loading) || Boolean(editingMessageId)}
          className={`mb-1 rounded-2xl p-3 shadow-lg transition-all active:scale-95 ${
            isRecordingVoice
              ? "bg-red-500 text-white shadow-red-500/20"
              : "border border-sage-light/20 bg-white text-forest hover:bg-cream/60"
          } disabled:cursor-not-allowed disabled:opacity-30`}
          aria-label={isRecordingVoice ? "РћСЃС‚Р°РЅРѕРІРёС‚СЊ Р·Р°РїРёСЃСЊ" : "Р—Р°РїРёСЃР°С‚СЊ РіРѕР»РѕСЃРѕРІРѕРµ"}
        >
          {sendingVoice ? <Loader2 className="h-5 w-5 animate-spin" /> : isRecordingVoice ? <Square className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
        </button>
        <button
          onClick={onSend}
          disabled={needsName || !input.trim() || sending || (!sessionId && !loading)}
          className="mb-1 rounded-2xl bg-forest p-3 text-white shadow-lg shadow-forest/20 transition-all active:scale-95 hover:bg-forest/90 disabled:cursor-not-allowed disabled:opacity-30"
        >
          {sending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
        </button>
      </div>
      {isRecordingVoice ? (
        <p className="mt-2 text-center text-[11px] font-bold text-red-500">
          РРґС‘С‚ Р·Р°РїРёСЃСЊ. РќР°Р¶РјРёС‚Рµ РєРІР°РґСЂР°С‚, С‡С‚РѕР±С‹ РѕС‚РїСЂР°РІРёС‚СЊ РіРѕР»РѕСЃРѕРІРѕРµ.
        </p>
      ) : recordingStartedAt ? (
        <p className="mt-2 text-center text-[11px] text-forest/40">
          РќР°С‡Р°Р»Рѕ Р·Р°РїРёСЃРё: {new Date(recordingStartedAt).toLocaleTimeString("ru", { hour: "2-digit", minute: "2-digit" })}
        </p>
      ) : null}
      <p className="mt-3 text-center text-[10px] font-medium uppercase tracking-wide text-forest/30">
        Р‘РµР·РѕРїР°СЃРЅС‹Р№ С‡Р°С‚ вЂў Р›Р°Рґ
      </p>
    </div>
  );
}
