"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play, Waves } from "lucide-react";

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
  const levels = useAudioWaveform({
    barCount: 32,
    source: payload.url,
  });
  const progress = duration > 0 ? currentTime / duration : 0;
  const isVisitor = tone === "visitor";
  const subTextClassName = isVisitor ? "text-white/65" : "text-forest/45";
  const buttonClassName = isVisitor
    ? "bg-white text-forest hover:bg-white/90"
    : "bg-sage-dark text-white hover:bg-sage-dark/90";
  const barIdleClassName = isVisitor ? "bg-white/28" : "bg-sage-light/35";
  const barActiveClassName = isVisitor ? "bg-sage-light" : "bg-sage-dark";
  const railClassName = isVisitor ? "bg-white/10" : "bg-forest/5";

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
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Waves className="h-4 w-4 shrink-0" />
        <p className="text-xs font-bold">Голосовое сообщение</p>
        <span className={`text-[10px] font-medium ${subTextClassName}`}>
          {formatDuration(duration || (payload.durationMs ?? 0) / 1000)}
        </span>
      </div>

      <div className={`flex items-center gap-3 rounded-[1.15rem] px-3 py-2.5 ${railClassName}`}>
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
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition ${buttonClassName}`}
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
            className="flex h-10 w-full items-center gap-[3px]"
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
                className={`block w-[4px] rounded-full transition-colors ${
                  index / levels.length <= progress
                    ? barActiveClassName
                    : barIdleClassName
                }`}
                style={{ height }}
              />
            ))}
          </button>

          <div
            className={`mt-1 flex items-center justify-between text-[10px] font-medium ${subTextClassName}`}
          >
            <span>{formatDuration(currentTime)}</span>
            <span>{formatFileSize(payload.fileSize) ?? formatDuration(duration)}</span>
          </div>
        </div>
      </div>

      <audio
        ref={audioRef}
        preload="metadata"
        src={payload.url}
        className="hidden"
      />
    </div>
  );
}
