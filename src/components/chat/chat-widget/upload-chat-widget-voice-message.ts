import type { Message } from "@/components/chat/chat-widget/types";

type UploadChatWidgetVoiceMessageParams = {
  blob: Blob;
  durationMs: number;
  replyToId: number | null;
  sessionId: number;
  transcript: string;
};

export async function uploadChatWidgetVoiceMessage({
  blob,
  durationMs,
  replyToId,
  sessionId,
  transcript,
}: UploadChatWidgetVoiceMessageParams): Promise<Message> {
  const formData = new FormData();
  formData.append("sender", "visitor");
  formData.append("durationMs", String(durationMs));
  if (transcript.trim()) {
    formData.append("transcript", transcript.trim());
  }
  if (replyToId) {
    formData.append("replyToId", String(replyToId));
  }

  const extension = blob.type.includes("ogg") ? "ogg" : blob.type.includes("mp4") ? "m4a" : "webm";
  formData.append("file", new File([blob], `voice-message.${extension}`, { type: blob.type || "audio/webm" }));

  const res = await fetch(`/api/chat/sessions/${sessionId}/voice-message`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const payload = await res.json().catch(() => null);
    throw new Error(typeof payload?.error === "string" ? payload.error : "Failed to upload voice message");
  }

  return res.json();
}
