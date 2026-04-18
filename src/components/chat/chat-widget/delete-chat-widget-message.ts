type DeleteChatWidgetMessageParams = {
  messageId: number;
  sessionId: number;
};

export async function deleteChatWidgetMessage({
  messageId,
  sessionId,
}: DeleteChatWidgetMessageParams) {
  const response = await fetch(`/api/chat/sessions/${sessionId}/messages`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messageId,
      sender: "visitor",
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to delete");
  }

  return (await response.json()) as { deletedIds: number[] };
}
