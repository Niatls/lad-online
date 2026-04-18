"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, ChevronUp, Pause, Play } from "lucide-react";

import { useAudioWaveform } from "@/components/chat/use-audio-waveform";
import type { VoiceMessagePayload } from "@/lib/chat-message-format";

function formatDuration(durationSeconds: number) {
  const totalSeconds = Math.max(0, Math.floor(durationSeconds));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function formatFileSize(fileSize?: number | null) {
  if (!fileSize || fileSize <= 0) {
    return null;
  }

  if (fileSize < 1024 * 1024) {
    return `${(fileSize / 1024).toFixed(1)} КБ`;
  }

  return `${(fileSize / (1024 * 1024)).toFixed(1)} МБ`;
}

type VoiceMessagePlayerProps = {
  payload: VoiceMessagePayload;
  tone: "visitor" | "admin" | "system";
};

export function VoiceMessagePlayer({
  payload,
  tone,
}: VoiceMessagePlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const waveformRef = useRef<HTMLButtonElement | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(
    payload.durationMs ? payload.durationMs / 1000 : 0,
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const [isTranscriptOpen, setIsTranscriptOpen] = useState(false);
  const levels = useAudioWaveform({
    barCount: 42,
    source: payload.url,
  });
  const progress = duration > 0 ? currentTime / duration : 0;
  const isVisitor = tone === "visitor";
  const buttonClassName = isVisitor
    ? "bg-white text-forest hover:bg-white/90"
    : "bg-sage-dark text-white hover:bg-sage-dark/90";
  const barIdleClassName = isVisitor ? "bg-white/35" : "bg-sage-light/55";
  const barActiveClassName = isVisitor ? "bg-sage-light" : "bg-sage-dark";
  const metaClassName = isVisitor ? "text-white/88" : "text-forest/72";
  const labelClassName = isVisitor ? "text-white/92" : "text-forest/84";

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }

    const handleLoadedMetadata = () => {
      setDuration(
        audio.duration || (payload.durationMs ? payload.durationMs / 1000 : 0),
      );
    };
    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handlePause = () => setIsPlaying(false);
    const handlePlay = () => setIsPlaying(true);

    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("ended", handlePause);

    return () => {
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("ended", handlePause);
    };
  }, [payload.durationMs]);

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-3">
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
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition ${buttonClassName}`}
          aria-label={isPlaying ? "Пауза" : "Воспроизвести"}
        >
          {isPlaying ? (
            <Pause className="h-4 w-4" />
          ) : (
            <Play className="ml-0.5 h-4 w-4" />
          )}
        </button>

        <div className="min-w-0 flex-1">
          <button
            ref={waveformRef}
            type="button"
            className="flex h-7 w-full items-center gap-[3px]"
            onClick={(event) => {
              const audio = audioRef.current;
              const waveform = waveformRef.current;
              if (!audio || !waveform || !duration) {
                return;
              }

              const rect = waveform.getBoundingClientRect();
              const ratio = Math.min(
                1,
                Math.max(0, (event.clientX - rect.left) / rect.width),
              );
              audio.currentTime = duration * ratio;
              setCurrentTime(audio.currentTime);
            }}
          >
            {levels.map((height, index) => (
              <span
                key={`${height}-${index}`}
                className={`block w-[3px] rounded-full transition-colors ${
                  index / levels.length <= progress
                    ? barActiveClassName
                    : barIdleClassName
                }`}
                style={{ height: Math.max(5, height - 3) }}
              />
            ))}
          </button>

          <div className={`mt-1 flex items-center justify-between gap-3 text-[11px] font-semibold ${metaClassName}`}>
            <span className={labelClassName}>
              {formatDuration(currentTime)}
              {formatFileSize(payload.fileSize)
                ? `, ${formatFileSize(payload.fileSize)}`
                : ""}
            </span>
            <span className="flex shrink-0 items-center gap-2">
              {formatDuration(duration)}
              {payload.transcript ? (
                <button
                  type="button"
                  onClick={() => setIsTranscriptOpen((value) => !value)}
                  className={`inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold transition ${
                    isVisitor
                      ? "bg-white/12 text-white/85 hover:bg-white/20"
                      : "bg-forest/5 text-forest/60 hover:bg-forest/10"
                  }`}
                  aria-expanded={isTranscriptOpen}
                  aria-label={
                    isTranscriptOpen ? "Скрыть расшифровку" : "Показать расшифровку"
                  }
                >
                  Aa
                  {isTranscriptOpen ? (
                    <ChevronUp className="h-3 w-3" />
                  ) : (
                    <ChevronDown className="h-3 w-3" />
                  )}
                </button>
              ) : null}
            </span>
          </div>
        </div>
      </div>

      {payload.transcript && isTranscriptOpen ? (
        <p className={`text-xs font-medium leading-relaxed ${metaClassName}`}>
          {payload.transcript}
        </p>
      ) : null}

      <audio
        ref={audioRef}
        preload="metadata"
        src={payload.url}
        className="hidden"
      />
    </div>
  );
}
