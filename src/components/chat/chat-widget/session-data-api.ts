import type { Message, VoiceInvite } from "@/components/chat/chat-widget/types";

type CreateChatWidgetSessionParams = {
  visitorId: string;
  visitorName: string;
};

type ChatWidgetSession = {
  id: number;
  messages?: Message[];
};

export async function createChatWidgetSession({
  visitorId,
  visitorName,
}: CreateChatWidgetSessionParams): Promise<ChatWidgetSession> {
  const res = await fetch("/api/chat/sessions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ visitorId, visitorName }),
  });

  if (!res.ok) {
    throw new Error("Failed to create session");
  }

  return res.json();
}

export async function fetchChatWidgetMessages(sessionId: number, after: number): Promise<Message[]> {
  const res = await fetch(`/api/chat/sessions/${sessionId}/messages?after=${after}`);
  if (!res.ok) {
    throw new Error("Failed to fetch messages");
  }

  return res.json();
}

export async function fetchChatWidgetVoiceInvite(sessionId: number): Promise<VoiceInvite | null> {
  const res = await fetch(`/api/chat/sessions/${sessionId}/voice`, { cache: "no-store" });
  if (!res.ok) {
    return null;
  }

  const data = await res.json();
  return (data?.invite as VoiceInvite | null) ?? null;
}
