import type { Message } from "@/components/admin/admin-chat-panel/types";

type SendAdminMessageParams = {
  content: string;
  replyToId: number | null;
  selectedId: number;
};

type UploadAdminVoiceMessageParams = {
  blob: Blob;
  durationMs: number;
  replyToId: number | null;
  selectedId: number;
};

export async function editAdminMessage(
  selectedId: number,
  messageId: number,
  content: string
): Promise<Message> {
  const res = await fetch(`/api/chat/sessions/${selectedId}/messages`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messageId, content, sender: "admin" }),
  });

  if (!res.ok) {
    throw new Error("Failed to edit");
  }

  return res.json();
}

export function createOptimisticAdminMessage(
  content: string,
  replyTarget: Message | null
): Message {
  return {
    id: Date.now(),
    sender: "admin",
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
          content: replyTarget.isDeleted
            ? "\u0421\u043e\u043e\u0431\u0449\u0435\u043d\u0438\u0435 \u0443\u0434\u0430\u043b\u0435\u043d\u043e"
            : replyTarget.content,
          isDeleted: replyTarget.isDeleted,
        }
      : null,
    createdAt: new Date().toISOString(),
  };
}

export async function sendAdminMessage({
  content,
  replyToId,
  selectedId,
}: SendAdminMessageParams): Promise<Message> {
  const res = await fetch(`/api/chat/sessions/${selectedId}/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content, sender: "admin", replyToId }),
  });

  if (!res.ok) {
    throw new Error("Failed to send");
  }

  return res.json();
}

export async function uploadAdminVoiceMessage({
  blob,
  durationMs,
  replyToId,
  selectedId,
}: UploadAdminVoiceMessageParams): Promise<Message> {
  const formData = new FormData();
  formData.append("sender", "admin");
  formData.append("durationMs", String(durationMs));
  if (replyToId) {
    formData.append("replyToId", String(replyToId));
  }

  const extension = blob.type.includes("ogg") ? "ogg" : blob.type.includes("mp4") ? "m4a" : "webm";
  formData.append(
    "file",
    new File([blob], `voice-message.${extension}`, { type: blob.type || "audio/webm" })
  );

  const res = await fetch(`/api/chat/sessions/${selectedId}/voice-message`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const payload = await res.json().catch(() => null);
    throw new Error(
      typeof payload?.error === "string" ? payload.error : "Failed to upload voice message"
    );
  }

  return res.json();
}
