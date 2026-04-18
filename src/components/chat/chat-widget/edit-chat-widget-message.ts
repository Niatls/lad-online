import type { Message } from "@/components/chat/chat-widget/types";

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
