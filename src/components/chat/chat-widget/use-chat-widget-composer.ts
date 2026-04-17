import { useCallback, useEffect } from "react";

import { useChatWidgetHandleSend } from "@/components/chat/chat-widget/use-chat-widget-handle-send";
import { useChatWidgetStopVoiceCapture } from "@/components/chat/chat-widget/use-chat-widget-stop-voice-capture";
import { useChatWidgetToggleVoiceRecording } from "@/components/chat/chat-widget/use-chat-widget-toggle-voice-recording";
import { useChatWidgetUploadVoiceMessage } from "@/components/chat/chat-widget/use-chat-widget-upload-voice-message";
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
  const stopVoiceCapture = useChatWidgetStopVoiceCapture({
    mediaRecorderRef,
    mediaStreamRef,
  });

  const uploadVoiceMessage = useChatWidgetUploadVoiceMessage({
    sessionId,
    replyTarget,
    lastMsgIdRef,
    setError,
    setMessages,
    setReplyTarget,
    setSendingVoice,
  });

  const handleToggleVoiceRecording = useChatWidgetToggleVoiceRecording({
    needsName,
    sessionId,
    sendingVoice,
    isRecordingVoice,
    editingMessageId,
    mediaRecorderRef,
    mediaStreamRef,
    recordingStartedAtRef,
    voiceChunksRef,
    setError,
    setIsRecordingVoice,
    setRecordingStartedAt,
    stopVoiceCapture,
    uploadVoiceMessage,
  });

  const handleSend = useChatWidgetHandleSend({
    sessionId,
    input,
    sending,
    editingMessageId,
    replyTarget,
    lastMsgIdRef,
    setEditingMessageId,
    setError,
    setInput,
    setMessages,
    setReplyTarget,
    setSending,
  });

  return {
    handleSend,
    handleToggleVoiceRecording,
  };
}
