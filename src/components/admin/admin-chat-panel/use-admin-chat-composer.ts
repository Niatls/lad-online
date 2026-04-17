import { useCallback, useEffect } from "react";

import { getSupportedRecorderMimeType } from "@/components/admin/admin-chat-panel/utils";
import type { Message } from "@/components/admin/admin-chat-panel/types";

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

  useEffect(() => () => {
    mediaRecorderRef.current?.stream.getTracks().forEach((track) => track.stop());
    mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
  }, [mediaRecorderRef, mediaStreamRef]);

  const uploadVoiceMessage = useCallback(async (blob: Blob, durationMs: number) => {
    if (!selectedId) {
      return;
    }

    const formData = new FormData();
    formData.append("sender", "admin");
    formData.append("durationMs", String(durationMs));
    if (replyTarget?.id) {
      formData.append("replyToId", String(replyTarget.id));
    }
    const extension = blob.type.includes("ogg") ? "ogg" : blob.type.includes("mp4") ? "m4a" : "webm";
    formData.append("file", new File([blob], `voice-message.${extension}`, { type: blob.type || "audio/webm" }));

    setSendingVoice(true);
    setReplyTarget(null);

    try {
      const res = await fetch(`/api/chat/sessions/${selectedId}/voice-message`, {
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
      await loadSessions();
    } catch (err) {
      console.error("Failed to upload voice message:", err);
    } finally {
      setSendingVoice(false);
    }
  }, [lastMsgIdRef, loadSessions, replyTarget, selectedId, setMessages, setReplyTarget, setSendingVoice]);

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
        const res = await fetch(`/api/chat/sessions/${selectedId}/messages`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messageId: editingMessageId, content: text, sender: "admin" }),
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
      } finally {
        setSending(false);
      }
      return;
    }

    const currentReplyTarget = replyTarget;
    setInput("");
    setSending(true);

    const optimistic: Message = {
      id: Date.now(),
      sender: "admin",
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
      const res = await fetch(`/api/chat/sessions/${selectedId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: text, sender: "admin", replyToId: currentReplyTarget?.id ?? null }),
      });
      if (res.ok) {
        const msg = await res.json();
        setMessages((prev) => prev.map((message) => (message.id === optimistic.id ? msg : message)));
        lastMsgIdRef.current = Math.max(lastMsgIdRef.current, msg.id);
      } else {
        throw new Error("Failed to send");
      }
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
