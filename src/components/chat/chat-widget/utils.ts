export function getVisitorId(): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem("chat_visitor_id");
  if (!id) {
    id = `v_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    localStorage.setItem("chat_visitor_id", id);
  }
  return id;
}

export function getStoredVisitorName(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("chat_visitor_name") ?? "";
}

export function getVoiceSessionStorageKey(sessionId: number) {
  return `chat_active_voice_token_${sessionId}`;
}

export function getSupportedRecorderMimeType() {
  if (typeof window === "undefined" || typeof MediaRecorder === "undefined") {
    return null;
  }

  const mimeTypes = ["audio/webm;codecs=opus", "audio/webm", "audio/ogg;codecs=opus", "audio/mp4"];
  return mimeTypes.find((mimeType) => MediaRecorder.isTypeSupported(mimeType)) ?? "";
}
