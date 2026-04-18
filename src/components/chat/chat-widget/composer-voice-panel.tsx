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

function buildBars(seed: number) {
  return Array.from({ length: 28 }, (_, index) => 8 + ((seed + index * 9) % 18));
}

type VoiceBarsProps = {
  activeColor: string;
  animated: boolean;
  idleColor: string;
  now: number;
  progress?: number;
};

function VoiceBars({
  activeColor,
  animated,
  idleColor,
  now,
  progress = 0,
}: VoiceBarsProps) {
  const bars = useMemo(() => buildBars(now % 23), [now]);

  return (
    <div className="flex h-9 flex-1 items-center gap-[3px] overflow-hidden">
      {bars.map((baseHeight, index) => {
        const height = animated
          ? Math.max(8, baseHeight + Math.round(Math.sin(now / 160 + index) * 5))
          : baseHeight;

        return (
          <span
            key={`${baseHeight}-${index}`}
            className={`block w-[4px] rounded-full transition-all ${
              index / bars.length <= progress ? activeColor : idleColor
            }`}
            style={{ height }}
          />
        );
      })}
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
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUrl = useMemo(
    () => (voiceDraft ? URL.createObjectURL(voiceDraft.blob) : null),
    [voiceDraft],
  );
  const draftProgress =
    voiceDraft && voiceDraft.durationMs > 0
      ? currentTime / (voiceDraft.durationMs / 1000)
      : 0;

  useEffect(() => {
    if (!isRecordingVoice && !voiceDraft) {
      return;
    }

    const intervalId = window.setInterval(() => setNow(Date.now()), 120);
    return () => window.clearInterval(intervalId);
  }, [isRecordingVoice, voiceDraft]);

  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  if (isRecordingVoice) {
    return (
      <div className="mb-3 flex items-center gap-3 rounded-[1.6rem] bg-forest px-3.5 py-3 text-white shadow-[0_16px_36px_rgba(45,74,62,0.24)]">
        <button
          type="button"
          onClick={onToggleVoiceRecording}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-red-500 transition hover:bg-white/90"
          aria-label="Остановить запись"
        >
          <span className="h-3.5 w-3.5 rounded-sm bg-current" />
        </button>
        <VoiceBars
          activeColor="bg-sage-light"
          animated
          idleColor="bg-white/30"
          now={now}
        />
        <span className="min-w-[3rem] text-sm font-semibold tabular-nums text-white/90">
          {formatDuration(recordingStartedAt ? now - recordingStartedAt : 0)}
        </span>
      </div>
    );
  }

  if (!voiceDraft || !audioUrl) {
    return null;
  }

  return (
    <div className="mb-3 rounded-[1.6rem] border border-sage-light/25 bg-cream/80 px-3.5 py-3 text-forest shadow-[0_16px_36px_rgba(45,74,62,0.12)]">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onToggleVoiceRecording}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-sage-dark transition hover:bg-white/90"
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
              return;
            }

            await audio.play();
          }}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sage-dark text-white transition hover:bg-sage-dark/90"
          aria-label={isPlaying ? "Пауза" : "Прослушать запись"}
        >
          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="ml-0.5 h-4 w-4" />}
        </button>
        <VoiceBars
          activeColor="bg-sage-dark"
          animated={false}
          idleColor="bg-sage-light/35"
          now={now}
          progress={draftProgress}
        />
        <span className="min-w-[3rem] text-sm font-semibold tabular-nums text-forest/80">
          {formatDuration(voiceDraft.durationMs)}
        </span>
        <button
          type="button"
          onClick={onSendVoiceDraft}
          disabled={sendingVoice}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sage-dark text-white transition hover:bg-sage-dark/90 disabled:opacity-50"
          aria-label="Отправить запись"
        >
          <Send className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={onClearVoiceDraft}
          disabled={sendingVoice}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-forest/70 transition hover:bg-white/90 disabled:opacity-50"
          aria-label="Удалить запись"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-2 flex items-center justify-between px-1 text-[11px] font-medium text-forest/55">
        <span>Голосовое сообщение</span>
        <span>
          {formatDuration(currentTime * 1000)} / {formatDuration(voiceDraft.durationMs)}
        </span>
      </div>

      <audio
        ref={audioRef}
        preload="metadata"
        src={audioUrl}
        className="hidden"
        onEnded={() => {
          setIsPlaying(false);
          setCurrentTime(0);
        }}
        onPause={() => setIsPlaying(false)}
        onPlay={() => setIsPlaying(true)}
        onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
      />
    </div>
  );
}
