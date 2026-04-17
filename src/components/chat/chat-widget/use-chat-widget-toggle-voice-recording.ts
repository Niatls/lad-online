import { useCallback } from "react";

import { startChatWidgetVoiceRecording } from "@/components/chat/chat-widget/composer-voice-recording";

type UseChatWidgetToggleVoiceRecordingParams = {
  needsName: boolean;
  sessionId: number | null;
  sendingVoice: boolean;
  isRecordingVoice: boolean;
  editingMessageId: number | null;
  mediaRecorderRef: React.MutableRefObject<MediaRecorder | null>;
  mediaStreamRef: React.MutableRefObject<MediaStream | null>;
  recordingStartedAtRef: React.MutableRefObject<number | null>;
  voiceChunksRef: React.MutableRefObject<Blob[]>;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
  setIsRecordingVoice: React.Dispatch<React.SetStateAction<boolean>>;
  setRecordingStartedAt: React.Dispatch<React.SetStateAction<number | null>>;
  stopVoiceCapture: () => void;
  uploadVoiceMessage: (blob: Blob, durationMs: number) => Promise<void>;
};

export function useChatWidgetToggleVoiceRecording({
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
}: UseChatWidgetToggleVoiceRecordingParams) {
  return useCallback(async () => {
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
}
