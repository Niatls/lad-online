"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Mic, Pause, Play, Send, Trash2 } from "lucide-react";

import type { VoiceDraft } from "@/components/chat/chat-widget/types";

type ChatWidgetComposerVoicePanelProps = {
  isRecordingVoice: boolean;
  recordingStartedAt: number | null;
  sendingVoice: boolean;
  voiceDraft: VoiceDraft | null;
  onClearVoiceDraft: () => void;
  onSendVoiceDraft: () => void;
  onToggleVoiceRecording: () => void;
};

function formatDuration(durationMs: number) {
  const totalSeconds = Math.max(0, Math.floor(durationMs / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function VoiceBars({ animated }: { animated: boolean }) {
  const bars = useMemo(
    () => Array.from({ length: 40 }, (_, index) => 8 + ((index * 5) % 18)),
    []
  );

  return (
    <div className="flex h-8 flex-1 items-center gap-[2px] overflow-hidden px-1">
      {bars.map((height, index) => (
        <span
          key={`${height}-${index}`}
          className={`block w-[3px] rounded-full bg-white/75 ${
            animated ? "animate-pulse" : ""
          }`}
          style={{
            height,
            animationDelay: `${index * 0.025}s`,
            opacity: animated ? 0.8 : 0.55,
          }}
        />
      ))}
    </div>
  );
}

export function ChatWidgetComposerVoicePanel({
  isRecordingVoice,
  recordingStartedAt,
  sendingVoice,
  voiceDraft,
  onClearVoiceDraft,
  onSendVoiceDraft,
  onToggleVoiceRecording,
}: ChatWidgetComposerVoicePanelProps) {
  const [now, setNow] = useState(() => Date.now());
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUrl = useMemo(
    () => (voiceDraft ? URL.createObjectURL(voiceDraft.blob) : null),
    [voiceDraft]
  );

  useEffect(() => {
    if (!isRecordingVoice) {
      return;
    }

    const intervalId = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(intervalId);
  }, [isRecordingVoice]);

  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  if (isRecordingVoice) {
    return (
      <div className="mb-3 flex items-center gap-3 rounded-[1.5rem] bg-slate-500 px-3 py-2 text-white shadow-[0_12px_30px_rgba(100,116,139,0.2)]">
        <button
          type="button"
          onClick={onToggleVoiceRecording}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-red-500 transition hover:bg-white"
          aria-label="Остановить запись"
        >
          <span className="h-3.5 w-3.5 rounded-sm bg-current" />
        </button>
        <VoiceBars animated />
        <span className="min-w-[2.75rem] text-sm font-semibold tabular-nums">
          {formatDuration(
            recordingStartedAt ? now - recordingStartedAt : 0
          )}
        </span>
      </div>
    );
  }

  if (!voiceDraft || !audioUrl) {
    return null;
  }

  return (
    <div className="mb-3 rounded-[1.5rem] bg-slate-400/90 px-3 py-2 text-white shadow-[0_12px_30px_rgba(148,163,184,0.24)]">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onToggleVoiceRecording}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-red-400 transition hover:bg-white"
          aria-label="Дополнить запись"
        >
          <Mic className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={async () => {
            const audio = audioRef.current;
            if (!audio) {
              return;
            }

            if (isPlaying) {
              audio.pause();
              setIsPlaying(false);
              return;
            }

            await audio.play();
            setIsPlaying(true);
          }}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-slate-500 transition hover:bg-white"
          aria-label={isPlaying ? "Пауза" : "Прослушать запись"}
        >
          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </button>
        <VoiceBars animated={false} />
        <span className="min-w-[2.75rem] text-sm font-semibold tabular-nums">
          {formatDuration(voiceDraft.durationMs)}
        </span>
        <button
          type="button"
          onClick={onSendVoiceDraft}
          disabled={sendingVoice}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-sage-dark transition hover:bg-white disabled:opacity-50"
          aria-label="Отправить запись"
        >
          <Send className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={onClearVoiceDraft}
          disabled={sendingVoice}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white transition hover:bg-white/30 disabled:opacity-50"
          aria-label="Удалить запись"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <audio
        ref={audioRef}
        preload="metadata"
        src={audioUrl}
        className="hidden"
        onEnded={() => setIsPlaying(false)}
        onPause={() => setIsPlaying(false)}
      />
    </div>
  );
}
