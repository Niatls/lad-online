import { useCallback, useEffect } from "react";

import type { Message } from "@/components/chat/chat-widget/types";
import { getSupportedRecorderMimeType } from "@/components/chat/chat-widget/utils";

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

  const uploadVoiceMessage = useCallback(async (blob: Blob, durationMs: number) => {
    if (!sessionId) {
      return;
    }

    const formData = new FormData();
    formData.append("sender", "visitor");
    formData.append("durationMs", String(durationMs));
    if (replyTarget?.id) {
      formData.append("replyToId", String(replyTarget.id));
    }
    const extension = blob.type.includes("ogg") ? "ogg" : blob.type.includes("mp4") ? "m4a" : "webm";
    formData.append("file", new File([blob], `voice-message.${extension}`, { type: blob.type || "audio/webm" }));

    setSendingVoice(true);
    setReplyTarget(null);

    try {
      const res = await fetch(`/api/chat/sessions/${sessionId}/voice-message`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const payload = await res.json().catch(() => null);
        throw new Error(typeof payload?.error === "string" ? payload.error : "Failed to upload voice message");
      }

      const message = await res.json();
      setMessages((prev) => [...prev, message]);
      lastMsgIdRef.current = Math.max(lastMsgIdRef.current, message.id);
    } catch (err) {
      console.error("Failed to upload voice message:", err);
      setError(err instanceof Error ? `Голосовое: ${err.message}` : "Не удалось отправить голосовое сообщение.");
    } finally {
      setSendingVoice(false);
    }
  }, [lastMsgIdRef, replyTarget, sessionId, setError, setMessages, setReplyTarget, setSendingVoice]);

  const handleToggleVoiceRecording = useCallback(async () => {
    if (!sessionId || needsName || sendingVoice || editingMessageId) {
      return;
    }

    if (isRecordingVoice) {
      mediaRecorderRef.current?.stop();
      setIsRecordingVoice(false);
      return;
    }

    const mimeType = getSupportedRecorderMimeType();
    if (mimeType === null) {
      setError("Голосовые сообщения не поддерживаются в этом браузере.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      mediaStreamRef.current = stream;
      mediaRecorderRef.current = recorder;
      voiceChunksRef.current = [];
      setError(null);
      const startedAt = Date.now();
      recordingStartedAtRef.current = startedAt;
      setRecordingStartedAt(startedAt);

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          voiceChunksRef.current.push(event.data);
        }
      };

      recorder.onerror = () => {
        setError("Не удалось записать голосовое сообщение.");
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
          setError("Не удалось сохранить запись.");
          return;
        }

        await uploadVoiceMessage(blob, durationMs);
      };

      recorder.start();
      setIsRecordingVoice(true);
    } catch (err) {
      console.error("Failed to start voice recording:", err);
      setError("Не удалось получить доступ к микрофону.");
      stopVoiceCapture();
    }
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
        const res = await fetch(`/api/chat/sessions/${sessionId}/messages`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messageId: editingMessageId, content: text, sender: "visitor" }),
        });

        if (!res.ok) {
          throw new Error("Failed to edit");
        }

        const updated = await res.json();
        setMessages((prev) => prev.map((message) => (message.id === editingMessageId ? updated : message)));
        setEditingMessageId(null);
        setInput("");
      } catch (err) {
        console.error("Failed to edit:", err);
        setError("Не удалось сохранить изменения.");
      } finally {
        setSending(false);
      }
      return;
    }

    const currentReplyTarget = replyTarget;
    setInput("");
    setSending(true);

    const tempId = Date.now();
    const optimistic: Message = {
      id: tempId,
      sender: "visitor",
      content: text,
      replyToId: currentReplyTarget?.id ?? null,
      deletedAt: null,
      deletedBy: null,
      editedAt: null,
      isEdited: false,
      isDeleted: false,
      replyTo: currentReplyTarget
        ? {
          id: currentReplyTarget.id,
          sender: currentReplyTarget.sender,
          content: currentReplyTarget.isDeleted ? "Сообщение удалено" : currentReplyTarget.content,
          isDeleted: currentReplyTarget.isDeleted,
        }
        : null,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);
    setReplyTarget(null);

    try {
      const res = await fetch(`/api/chat/sessions/${sessionId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: text, sender: "visitor", replyToId: optimistic.replyToId }),
      });

      if (res.ok) {
        const message = await res.json();
        setMessages((prev) => prev.map((current) => (current.id === tempId ? message : current)));
        lastMsgIdRef.current = Math.max(lastMsgIdRef.current, message.id);
      } else {
        throw new Error("Failed to send");
      }
    } catch (err) {
      console.error("Failed to send:", err);
      setError("Не удалось отправить сообщение.");
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
