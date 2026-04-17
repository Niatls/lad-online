import type { Message } from "@/components/chat/chat-widget/types";

type SendChatWidgetMessageParams = {
  content: string;
  replyToId: number | null;
  sessionId: number;
};

type UploadChatWidgetVoiceMessageParams = {
  blob: Blob;
  durationMs: number;
  replyToId: number | null;
  sessionId: number;
};

export async function editChatWidgetMessage(
  sessionId: number,
  messageId: number,
  content: string,
): Promise<Message> {
  const res = await fetch(`/api/chat/sessions/${sessionId}/messages`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messageId, content, sender: "visitor" }),
  });

  if (!res.ok) {
    throw new Error("Failed to edit");
  }

  return res.json();
}

export function createOptimisticChatWidgetMessage(
  tempId: number,
  content: string,
  replyTarget: Message | null,
): Message {
  return {
    id: tempId,
    sender: "visitor",
    content,
    replyToId: replyTarget?.id ?? null,
    deletedAt: null,
    deletedBy: null,
    editedAt: null,
    isEdited: false,
    isDeleted: false,
    replyTo: replyTarget
      ? {
          id: replyTarget.id,
          sender: replyTarget.sender,
          content: replyTarget.isDeleted ? "РЎРѕРѕР±С‰РµРЅРёРµ СѓРґР°Р»РµРЅРѕ" : replyTarget.content,
          isDeleted: replyTarget.isDeleted,
        }
      : null,
    createdAt: new Date().toISOString(),
  };
}

export async function sendChatWidgetMessage({
  content,
  replyToId,
  sessionId,
}: SendChatWidgetMessageParams): Promise<Message> {
  const res = await fetch(`/api/chat/sessions/${sessionId}/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content, sender: "visitor", replyToId }),
  });

  if (!res.ok) {
    throw new Error("Failed to send");
  }

  return res.json();
}

export async function uploadChatWidgetVoiceMessage({
  blob,
  durationMs,
  replyToId,
  sessionId,
}: UploadChatWidgetVoiceMessageParams): Promise<Message> {
  const formData = new FormData();
  formData.append("sender", "visitor");
  formData.append("durationMs", String(durationMs));
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
