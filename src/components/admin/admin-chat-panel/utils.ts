export function formatUsage(value: number) {
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
  if (value < 1024 * 1024 * 1024) return `${(value / (1024 * 1024)).toFixed(2)} MB`;
  return `${(value / (1024 * 1024 * 1024)).toFixed(3)} GB`;
}

export function getAdminVoiceSessionStorageKey(sessionId: number) {
  return `admin_active_voice_token_${sessionId}`;
}

export function getSupportedRecorderMimeType() {
  if (typeof window === "undefined" || typeof MediaRecorder === "undefined") {
    return null;
  }

  const mimeTypes = ["audio/webm;codecs=opus", "audio/webm", "audio/ogg;codecs=opus", "audio/mp4"];
  return mimeTypes.find((mimeType) => MediaRecorder.isTypeSupported(mimeType)) ?? "";
}

export function formatAdminChatTime(date: string) {
  const parsed = new Date(date);
  const now = new Date();
  const isToday = parsed.toDateString() === now.toDateString();
  if (isToday) {
    return parsed.toLocaleTimeString("ru", { hour: "2-digit", minute: "2-digit" });
  }

  return (
    parsed.toLocaleDateString("ru", { day: "numeric", month: "short" }) +
    " " +
    parsed.toLocaleTimeString("ru", { hour: "2-digit", minute: "2-digit" })
  );
}
