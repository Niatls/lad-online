import type { Message } from "@/components/chat/chat-widget/types";

type SendChatWidgetMessageParams = {
  content: string;
  replyToId: number | null;
  sessionId: number;
};

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
