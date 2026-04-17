export async function createAdminVoiceToken(sessionId: number): Promise<{ token?: string }> {
  const res = await fetch(`/api/admin/chat/sessions/${sessionId}/voice-token`, {
    method: "POST",
  });

  if (!res.ok) {
    throw new Error("Failed to create voice token");
  }

  return res.json();
}

export async function deleteAdminChatSession(
  sessionId: number,
  mode: "hard" | "soft"
): Promise<void> {
  const res = await fetch(`/api/admin/chat/sessions/${sessionId}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mode }),
  });

  if (!res.ok) {
    throw new Error(mode === "soft" ? "Failed to archive session" : "Failed to delete session");
  }
}

export async function deleteAdminChatMessages(
  sessionId: number,
  messageIds: number[]
): Promise<number[]> {
  const res = await fetch(`/api/admin/chat/sessions/${sessionId}/messages`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messageIds }),
  });

  if (!res.ok) {
    throw new Error("Failed to delete messages");
  }

  const data = await res.json();
  return data.deletedIds ?? [];
}
