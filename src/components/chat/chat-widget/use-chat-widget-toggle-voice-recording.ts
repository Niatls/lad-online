import { useCallback } from "react";

import { startChatWidgetVoiceRecording } from "@/components/chat/chat-widget/composer-voice-recording";
import type { VoiceDraft } from "@/components/chat/chat-widget/types";

type UseChatWidgetToggleVoiceRecordingParams = {
  existingVoiceDraft: VoiceDraft | null;
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
  setVoiceDraft: React.Dispatch<React.SetStateAction<VoiceDraft | null>>;
  setVoiceTranscript: React.Dispatch<React.SetStateAction<string>>;
  stopVoiceCapture: () => void;
};

export function useChatWidgetToggleVoiceRecording({
  existingVoiceDraft,
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
  setVoiceDraft,
  setVoiceTranscript,
  stopVoiceCapture,
}: UseChatWidgetToggleVoiceRecordingParams) {
  return useCallback(async () => {
    if (!sessionId || needsName || sendingVoice || editingMessageId) {
      return;
    }

    if (isRecordingVoice) {
      mediaRecorderRef.current?.stop();
      return;
    }

    if (!existingVoiceDraft) {
      setVoiceTranscript("");
    }

    await startChatWidgetVoiceRecording({
      existingVoiceDraft,
      mediaRecorderRef,
      mediaStreamRef,
      recordingStartedAtRef,
      setError,
      setIsRecordingVoice,
      setRecordingStartedAt,
      setVoiceDraft,
      stopVoiceCapture,
      voiceChunksRef,
    });
  }, [
    editingMessageId,
    existingVoiceDraft,
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
    setVoiceDraft,
    setVoiceTranscript,
    stopVoiceCapture,
    voiceChunksRef,
  ]);
}
