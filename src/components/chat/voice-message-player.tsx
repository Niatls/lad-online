"use client";

import { PlayCircle } from "lucide-react";
import { VoiceMessagePayload } from "@/lib/chat-message-format";

function formatDuration(durationMs?: number | null) {
  if (!durationMs || durationMs < 1000) {
    return "0:00";
  }

  const totalSeconds = Math.round(durationMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

type VoiceMessagePlayerProps = {
  payload: VoiceMessagePayload;
  tone: "visitor" | "admin" | "system";
};

export function VoiceMessagePlayer({ payload, tone }: VoiceMessagePlayerProps) {
  const isVisitor = tone === "visitor";
  const shellClassName =
    tone === "system"
      ? "border-forest/10 bg-white/70 text-forest/80"
      : isVisitor
        ? "border-white/10 bg-white/10 text-white"
        : "border-sage-light/20 bg-cream/40 text-forest";
  const hintClassName = isVisitor ? "text-white/65" : "text-forest/45";

  return (
    <div className={`rounded-[1.25rem] border px-3 py-3 ${shellClassName}`}>
      <div className="mb-2 flex items-center gap-2">
        <PlayCircle className="h-4 w-4 shrink-0" />
        <p className="text-xs font-bold">Голосовое сообщение</p>
        <span className={`text-[10px] font-medium ${hintClassName}`}>{formatDuration(payload.durationMs)}</span>
      </div>
      <audio controls preload="metadata" src={payload.url} className="h-10 w-full" />
    </div>
  );
}
