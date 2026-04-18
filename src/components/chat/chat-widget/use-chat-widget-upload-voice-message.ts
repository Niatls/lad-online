import { useCallback } from "react";

import { uploadChatWidgetVoiceMessage } from "@/components/chat/chat-widget/composer-message-api";
import type { Message } from "@/components/chat/chat-widget/types";

type UseChatWidgetUploadVoiceMessageParams = {
  sessionId: number | null;
  replyTarget: Message | null;
  lastMsgIdRef: React.MutableRefObject<number>;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  setReplyTarget: React.Dispatch<React.SetStateAction<Message | null>>;
  setSendingVoice: React.Dispatch<React.SetStateAction<boolean>>;
};

export function useChatWidgetUploadVoiceMessage({
  sessionId,
  replyTarget,
  lastMsgIdRef,
  setError,
  setMessages,
  setReplyTarget,
  setSendingVoice,
}: UseChatWidgetUploadVoiceMessageParams) {
  return useCallback(
    async (blob: Blob, durationMs: number, transcript: string) => {
      if (!sessionId) {
        return;
      }

      setSendingVoice(true);
      setReplyTarget(null);

      try {
        const message = await uploadChatWidgetVoiceMessage({
          blob,
          durationMs,
          replyToId: replyTarget?.id ?? null,
          sessionId,
          transcript,
        });
        setMessages((prev) => [...prev, message]);
        lastMsgIdRef.current = Math.max(lastMsgIdRef.current, message.id);
      } catch (err) {
        console.error("Failed to upload voice message:", err);
        setError(
          err instanceof Error
            ? `Голосовое: ${err.message}`
            : "Не удалось отправить голосовое сообщение.",
        );
      } finally {
        setSendingVoice(false);
      }
    },
    [
      lastMsgIdRef,
      replyTarget,
      sessionId,
      setError,
      setMessages,
      setReplyTarget,
      setSendingVoice,
    ],
  );
}
