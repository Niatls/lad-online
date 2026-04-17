import { useCallback, useEffect } from "react";

import {
  createOptimisticAdminMessage,
  editAdminMessage,
  sendAdminMessage,
  uploadAdminVoiceMessage,
} from "@/components/admin/admin-chat-panel/composer-message-api";
import type { Message } from "@/components/admin/admin-chat-panel/types";
import { getSupportedRecorderMimeType } from "@/components/admin/admin-chat-panel/utils";

type UseAdminChatComposerParams = {
  selectedId: number | null;
  input: string;
  sending: boolean;
  sendingVoice: boolean;
  isRecordingVoice: boolean;
  editingMessageId: number | null;
  replyTarget: Message | null;
  loadSessions: () => Promise<void>;
  setInput: React.Dispatch<React.SetStateAction<string>>;
  setSending: React.Dispatch<React.SetStateAction<boolean>>;
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  setReplyTarget: React.Dispatch<React.SetStateAction<Message | null>>;
  setEditingMessageId: React.Dispatch<React.SetStateAction<number | null>>;
  setSendingVoice: React.Dispatch<React.SetStateAction<boolean>>;
  setIsRecordingVoice: React.Dispatch<React.SetStateAction<boolean>>;
  setRecordingStartedAt: React.Dispatch<React.SetStateAction<number | null>>;
  lastMsgIdRef: React.MutableRefObject<number>;
  mediaRecorderRef: React.MutableRefObject<MediaRecorder | null>;
  mediaStreamRef: React.MutableRefObject<MediaStream | null>;
  recordingStartedAtRef: React.MutableRefObject<number | null>;
  voiceChunksRef: React.MutableRefObject<Blob[]>;
};

export function useAdminChatComposer({
  selectedId,
  input,
  sending,
  sendingVoice,
  isRecordingVoice,
  editingMessageId,
  replyTarget,
  loadSessions,
  setInput,
  setSending,
  setMessages,
  setReplyTarget,
  setEditingMessageId,
  setSendingVoice,
  setIsRecordingVoice,
  setRecordingStartedAt,
  lastMsgIdRef,
  mediaRecorderRef,
  mediaStreamRef,
  recordingStartedAtRef,
  voiceChunksRef,
}: UseAdminChatComposerParams) {
  const stopVoiceCapture = useCallback(() => {
    mediaRecorderRef.current?.stream.getTracks().forEach((track) => track.stop());
    mediaRecorderRef.current = null;
    mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
    mediaStreamRef.current = null;
  }, [mediaRecorderRef, mediaStreamRef]);

  useEffect(
    () => () => {
      mediaRecorderRef.current?.stream.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
    },
    [mediaRecorderRef, mediaStreamRef]
  );

  const uploadVoiceMessage = useCallback(
    async (blob: Blob, durationMs: number) => {
      if (!selectedId) {
        return;
      }

      setSendingVoice(true);
      setReplyTarget(null);

      try {
        const message = await uploadAdminVoiceMessage({
          blob,
          durationMs,
          replyToId: replyTarget?.id ?? null,
          selectedId,
        });
        setMessages((prev) => [...prev, message]);
        lastMsgIdRef.current = Math.max(lastMsgIdRef.current, message.id);
        await loadSessions();
      } catch (err) {
        console.error("Failed to upload voice message:", err);
      } finally {
        setSendingVoice(false);
      }
    },
    [lastMsgIdRef, loadSessions, replyTarget, selectedId, setMessages, setReplyTarget, setSendingVoice]
  );

  const handleToggleVoiceRecording = useCallback(async () => {
    if (!selectedId || sendingVoice || editingMessageId) {
      return;
    }

    if (isRecordingVoice) {
      mediaRecorderRef.current?.stop();
      setIsRecordingVoice(false);
      return;
    }

    const mimeType = getSupportedRecorderMimeType();
    if (mimeType === null) {
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      mediaStreamRef.current = stream;
      mediaRecorderRef.current = recorder;
      voiceChunksRef.current = [];
      const startedAt = Date.now();
      recordingStartedAtRef.current = startedAt;
      setRecordingStartedAt(startedAt);

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          voiceChunksRef.current.push(event.data);
        }
      };

      recorder.onerror = () => {
        setIsRecordingVoice(false);
        setRecordingStartedAt(null);
        recordingStartedAtRef.current = null;
        stopVoiceCapture();
      };

      recorder.onstop = async () => {
        const durationMs = Math.max(1000, Date.now() - (recordingStartedAtRef.current ?? Date.now()));
        const blob = new Blob(voiceChunksRef.current, { type: recorder.mimeType || mimeType || "audio/webm" });
        voiceChunksRef.current = [];
        setRecordingStartedAt(null);
        recordingStartedAtRef.current = null;
        stopVoiceCapture();

        if (blob.size === 0) {
          return;
        }

        await uploadVoiceMessage(blob, durationMs);
      };

      recorder.start();
      setIsRecordingVoice(true);
    } catch (err) {
      console.error("Failed to start voice recording:", err);
      stopVoiceCapture();
    }
  }, [
    editingMessageId,
    isRecordingVoice,
    mediaRecorderRef,
    mediaStreamRef,
    recordingStartedAtRef,
    selectedId,
    sendingVoice,
    setIsRecordingVoice,
    setRecordingStartedAt,
    stopVoiceCapture,
    uploadVoiceMessage,
    voiceChunksRef,
  ]);

  const handleSend = useCallback(async () => {
    if (!input.trim() || !selectedId || sending) {
      return;
    }

    const text = input.trim();
    if (editingMessageId) {
      setSending(true);
      try {
        const updated = await editAdminMessage(selectedId, editingMessageId, text);
        setMessages((prev) => prev.map((message) => (message.id === editingMessageId ? updated : message)));
        setEditingMessageId(null);
        setInput("");
      } catch (err) {
        console.error("Failed to edit:", err);
      } finally {
        setSending(false);
      }
      return;
    }

    const currentReplyTarget = replyTarget;
    const optimistic = createOptimisticAdminMessage(text, currentReplyTarget);
    setInput("");
    setSending(true);
    setMessages((prev) => [...prev, optimistic]);
    setReplyTarget(null);

    try {
      const message = await sendAdminMessage({
        content: text,
        replyToId: currentReplyTarget?.id ?? null,
        selectedId,
      });
      setMessages((prev) => prev.map((entry) => (entry.id === optimistic.id ? message : entry)));
      lastMsgIdRef.current = Math.max(lastMsgIdRef.current, message.id);
    } catch (err) {
      console.error("Failed to send:", err);
      setReplyTarget(currentReplyTarget);
      setInput(text);
      setMessages((prev) => prev.filter((message) => message.id !== optimistic.id));
    } finally {
      setSending(false);
    }
  }, [
    editingMessageId,
    input,
    lastMsgIdRef,
    replyTarget,
    selectedId,
    sending,
    setEditingMessageId,
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
