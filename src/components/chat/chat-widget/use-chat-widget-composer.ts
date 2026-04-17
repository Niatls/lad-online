import { useCallback, useEffect } from "react";

import {
  createOptimisticChatWidgetMessage,
  editChatWidgetMessage,
  sendChatWidgetMessage,
  uploadChatWidgetVoiceMessage,
} from "@/components/chat/chat-widget/composer-message-api";
import { startChatWidgetVoiceRecording } from "@/components/chat/chat-widget/composer-voice-recording";
import type { Message } from "@/components/chat/chat-widget/types";

type UseChatWidgetComposerParams = {
  needsName: boolean;
  sessionId: number | null;
  input: string;
  sending: boolean;
  sendingVoice: boolean;
  isRecordingVoice: boolean;
  editingMessageId: number | null;
  replyTarget: Message | null;
  setInput: React.Dispatch<React.SetStateAction<string>>;
  setSending: React.Dispatch<React.SetStateAction<boolean>>;
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  setReplyTarget: React.Dispatch<React.SetStateAction<Message | null>>;
  setEditingMessageId: React.Dispatch<React.SetStateAction<number | null>>;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
  setSendingVoice: React.Dispatch<React.SetStateAction<boolean>>;
  setIsRecordingVoice: React.Dispatch<React.SetStateAction<boolean>>;
  setRecordingStartedAt: React.Dispatch<React.SetStateAction<number | null>>;
  lastMsgIdRef: React.MutableRefObject<number>;
  mediaRecorderRef: React.MutableRefObject<MediaRecorder | null>;
  mediaStreamRef: React.MutableRefObject<MediaStream | null>;
  recordingStartedAtRef: React.MutableRefObject<number | null>;
  voiceChunksRef: React.MutableRefObject<Blob[]>;
};

export function useChatWidgetComposer({
  needsName,
  sessionId,
  input,
  sending,
  sendingVoice,
  isRecordingVoice,
  editingMessageId,
  replyTarget,
  setInput,
  setSending,
  setMessages,
  setReplyTarget,
  setEditingMessageId,
  setError,
  setSendingVoice,
  setIsRecordingVoice,
  setRecordingStartedAt,
  lastMsgIdRef,
  mediaRecorderRef,
  mediaStreamRef,
  recordingStartedAtRef,
  voiceChunksRef,
}: UseChatWidgetComposerParams) {
  const stopVoiceCapture = useCallback(() => {
    mediaRecorderRef.current?.stream.getTracks().forEach((track) => track.stop());
    mediaRecorderRef.current = null;
    mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
    mediaStreamRef.current = null;
  }, [mediaRecorderRef, mediaStreamRef]);

  useEffect(() => () => stopVoiceCapture(), [stopVoiceCapture]);

  const uploadVoiceMessage = useCallback(
    async (blob: Blob, durationMs: number) => {
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
        });
        setMessages((prev) => [...prev, message]);
        lastMsgIdRef.current = Math.max(lastMsgIdRef.current, message.id);
      } catch (err) {
        console.error("Failed to upload voice message:", err);
        setError(err instanceof Error ? `Р“РѕР»РѕСЃРѕРІРѕРµ: ${err.message}` : "РќРµ СѓРґР°Р»РѕСЃСЊ РѕС‚РїСЂР°РІРёС‚СЊ РіРѕР»РѕСЃРѕРІРѕРµ СЃРѕРѕР±С‰РµРЅРёРµ.");
      } finally {
        setSendingVoice(false);
      }
    },
    [lastMsgIdRef, replyTarget, sessionId, setError, setMessages, setReplyTarget, setSendingVoice],
  );

  const handleToggleVoiceRecording = useCallback(async () => {
    if (!sessionId || needsName || sendingVoice || editingMessageId) {
      return;
    }

    if (isRecordingVoice) {
      mediaRecorderRef.current?.stop();
      setIsRecordingVoice(false);
      return;
    }

    await startChatWidgetVoiceRecording({
      mediaRecorderRef,
      mediaStreamRef,
      recordingStartedAtRef,
      setError,
      setIsRecordingVoice,
      setRecordingStartedAt,
      stopVoiceCapture,
      uploadVoiceMessage,
      voiceChunksRef,
    });
  }, [
    editingMessageId,
    isRecordingVoice,
    mediaRecorderRef,
    mediaStreamRef,
    needsName,
    recordingStartedAtRef,
    sendingVoice,
    sessionId,
    setError,
    setIsRecordingVoice,
    setRecordingStartedAt,
    stopVoiceCapture,
    uploadVoiceMessage,
    voiceChunksRef,
  ]);

  const handleSend = useCallback(async () => {
    if (!input.trim() || !sessionId || sending) {
      return;
    }
    setError((prev) => (prev ? null : prev));

    const text = input.trim();
    if (editingMessageId) {
      setSending(true);
      try {
        const updated = await editChatWidgetMessage(sessionId, editingMessageId, text);
        setMessages((prev) => prev.map((message) => (message.id === editingMessageId ? updated : message)));
        setEditingMessageId(null);
        setInput("");
      } catch (err) {
        console.error("Failed to edit:", err);
        setError("РќРµ СѓРґР°Р»РѕСЃСЊ СЃРѕС…СЂР°РЅРёС‚СЊ РёР·РјРµРЅРµРЅРёСЏ.");
      } finally {
        setSending(false);
      }
      return;
    }

    const currentReplyTarget = replyTarget;
    setInput("");
    setSending(true);

    const tempId = Date.now();
    const optimistic = createOptimisticChatWidgetMessage(tempId, text, currentReplyTarget);
    setMessages((prev) => [...prev, optimistic]);
    setReplyTarget(null);

    try {
      const message = await sendChatWidgetMessage({
        content: text,
        replyToId: optimistic.replyToId,
        sessionId,
      });
      setMessages((prev) => prev.map((current) => (current.id === tempId ? message : current)));
      lastMsgIdRef.current = Math.max(lastMsgIdRef.current, message.id);
    } catch (err) {
      console.error("Failed to send:", err);
      setError("РќРµ СѓРґР°Р»РѕСЃСЊ РѕС‚РїСЂР°РІРёС‚СЊ СЃРѕРѕР±С‰РµРЅРёРµ.");
      setMessages((prev) => prev.filter((message) => message.id !== tempId));
      setInput(text);
      setReplyTarget(currentReplyTarget);
    } finally {
      setSending(false);
    }
  }, [
    editingMessageId,
    input,
    lastMsgIdRef,
    replyTarget,
    sending,
    sessionId,
    setEditingMessageId,
    setError,
    setInput,
    setMessages,
    setReplyTarget,
    setSending,
  ]);

  return {
    handleSend,
    handleToggleVoiceRecording,
  };
}
