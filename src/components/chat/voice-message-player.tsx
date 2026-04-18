"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";

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
    barCount: 36,
    source: payload.url,
  });
  const progress = duration > 0 ? currentTime / duration : 0;
  const isVisitor = tone === "visitor";
  const isSystem = tone === "system";
  const shellClassName = isVisitor
    ? "bg-white/12"
    : isSystem
      ? "bg-forest/5"
      : "bg-forest/6";
  const buttonClassName = isVisitor
    ? "bg-white text-forest hover:bg-white/90"
    : "bg-sage-dark text-white hover:bg-sage-dark/90";
  const barIdleClassName = isVisitor ? "bg-white/30" : "bg-sage-light/40";
  const barActiveClassName = isVisitor ? "bg-sage-light" : "bg-sage-dark";
  const subTextClassName = isVisitor ? "text-white/72" : "text-forest/50";

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
    <div className={`rounded-[1.15rem] px-3 py-2.5 ${shellClassName}`}>
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
            className="flex h-8 w-full items-center gap-[3px]"
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
                style={{ height: Math.max(6, height - 2) }}
              />
            ))}
          </button>

          <div
            className={`mt-1 flex items-center justify-between text-[10px] font-medium ${subTextClassName}`}
          >
            <span>
              {formatDuration(currentTime)}
              {formatFileSize(payload.fileSize)
                ? `, ${formatFileSize(payload.fileSize)}`
                : ""}
            </span>
            <span>{formatDuration(duration)}</span>
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
