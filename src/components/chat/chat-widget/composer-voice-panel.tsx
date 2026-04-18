"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Mic,
  Pause,
  Play,
  Send,
  Trash2,
} from "lucide-react";

import { useAudioWaveform } from "@/components/chat/use-audio-waveform";
import type { VoiceDraft } from "@/components/chat/chat-widget/types";

type ChatWidgetComposerVoicePanelProps = {
  isRecordingVoice: boolean;
  mediaStreamRef: React.MutableRefObject<MediaStream | null>;
  recordingStartedAt: number | null;
  sendingVoice: boolean;
  voiceDraft: VoiceDraft | null;
  voiceTranscript: string;
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

function getInitialBars() {
  return Array.from({ length: 28 }, (_, index) => 8 + ((index * 9) % 18));
}

type VoiceBarsProps = {
  activeColor: string;
  idleColor: string;
  levels: number[];
  progress?: number;
};

function VoiceBars({
  activeColor,
  idleColor,
  levels,
  progress = 0,
}: VoiceBarsProps) {
  return (
    <div className="flex h-9 flex-1 items-center gap-[3px] overflow-hidden">
      {levels.map((height, index) => (
        <span
          key={`${height}-${index}`}
          className={`block w-[4px] rounded-full transition-all ${
            index / levels.length <= progress ? activeColor : idleColor
          }`}
          style={{ height }}
        />
      ))}
    </div>
  );
}

export function ChatWidgetComposerVoicePanel({
  isRecordingVoice,
  mediaStreamRef,
  recordingStartedAt,
  sendingVoice,
  voiceDraft,
  voiceTranscript,
  onClearVoiceDraft,
  onSendVoiceDraft,
  onToggleVoiceRecording,
}: ChatWidgetComposerVoicePanelProps) {
  const [now, setNow] = useState(() => Date.now());
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isTranscriptOpen, setIsTranscriptOpen] = useState(false);
  const [liveLevels, setLiveLevels] = useState<number[]>(() => getInitialBars());
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUrl = useMemo(
    () => (voiceDraft ? URL.createObjectURL(voiceDraft.blob) : null),
    [voiceDraft],
  );
  const decodedLevels = useAudioWaveform({
    barCount: 28,
    source: voiceDraft?.blob ?? null,
  });
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
    if (!isRecordingVoice || !mediaStreamRef.current) {
      setLiveLevels(getInitialBars());
      return;
    }

    const AudioContextCtor =
      window.AudioContext ||
      (window as typeof window & { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;

    if (!AudioContextCtor) {
      return;
    }

    const audioContext = new AudioContextCtor();
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    analyser.smoothingTimeConstant = 0.82;

    const source = audioContext.createMediaStreamSource(mediaStreamRef.current);
    source.connect(analyser);

    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    let animationFrameId = 0;

    const updateLevels = () => {
      analyser.getByteFrequencyData(dataArray);

      const chunkSize = Math.max(1, Math.floor(dataArray.length / 28));
      const nextLevels = Array.from({ length: 28 }, (_, index) => {
        const start = index * chunkSize;
        const slice = dataArray.slice(start, start + chunkSize);
        const average =
          slice.length > 0
            ? slice.reduce((sum, value) => sum + value, 0) / slice.length
            : 0;

        return 8 + Math.round((average / 255) * 22);
      });

      setLiveLevels(nextLevels);
      animationFrameId = window.requestAnimationFrame(updateLevels);
    };

    void audioContext.resume().catch(() => undefined);
    updateLevels();

    return () => {
      window.cancelAnimationFrame(animationFrameId);
      source.disconnect();
      analyser.disconnect();
      void audioContext.close().catch(() => undefined);
    };
  }, [isRecordingVoice, mediaStreamRef]);

  useEffect(() => {
    if (isRecordingVoice || !voiceDraft) {
      setIsTranscriptOpen(false);
    }
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
      <div className="space-y-2">
        <div className="flex items-center gap-3 rounded-[1.45rem] bg-forest px-3.5 py-3 text-white">
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
            idleColor="bg-white/30"
            levels={liveLevels}
          />
          <span className="min-w-[3rem] text-sm font-semibold tabular-nums text-white/90">
            {formatDuration(recordingStartedAt ? now - recordingStartedAt : 0)}
          </span>
          <button
            type="button"
            disabled
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/15 text-white/40"
            aria-label="Отправка будет доступна после записи"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  if (!voiceDraft || !audioUrl) {
    return null;
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 rounded-[1.45rem] bg-cream/80 px-3.5 py-3 text-forest">
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
          {isPlaying ? (
            <Pause className="h-4 w-4" />
          ) : (
            <Play className="ml-0.5 h-4 w-4" />
          )}
        </button>
        <VoiceBars
          activeColor="bg-sage-dark"
          idleColor="bg-sage-light/35"
          levels={decodedLevels}
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

      <div className="flex items-center justify-between gap-3 px-3 text-[11px] font-medium text-forest/55">
        {voiceTranscript ? (
          <button
            type="button"
            onClick={() => setIsTranscriptOpen((value) => !value)}
            className="flex min-w-0 items-center gap-1 rounded-full text-forest/60 transition hover:text-forest"
            aria-expanded={isTranscriptOpen}
            aria-label={isTranscriptOpen ? "Скрыть расшифровку" : "Показать расшифровку"}
          >
            <span className="font-semibold">Aa</span>
            {isTranscriptOpen ? (
              <ChevronUp className="h-3.5 w-3.5" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5" />
            )}
          </button>
        ) : (
          <span className="min-w-0 flex-1">Голосовое сообщение</span>
        )}
        <span className="shrink-0">
          {formatDuration(currentTime * 1000)} / {formatDuration(voiceDraft.durationMs)}
        </span>
      </div>

      {voiceTranscript && isTranscriptOpen ? (
        <p className="px-3 text-xs font-medium leading-relaxed text-forest/70">
          {voiceTranscript}
        </p>
      ) : null}

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
