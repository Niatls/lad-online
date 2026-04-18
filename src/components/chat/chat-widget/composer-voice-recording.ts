import { attachChatWidgetVoiceDataHandler } from "@/components/chat/chat-widget/attach-chat-widget-voice-data-handler";
import { attachChatWidgetVoiceErrorHandler } from "@/components/chat/chat-widget/attach-chat-widget-voice-error-handler";
import { attachChatWidgetVoiceStopHandler } from "@/components/chat/chat-widget/attach-chat-widget-voice-stop-handler";
import { createChatWidgetVoiceRecorder } from "@/components/chat/chat-widget/create-chat-widget-voice-recorder";
import { initializeChatWidgetVoiceRecording } from "@/components/chat/chat-widget/initialize-chat-widget-voice-recording";
import type { VoiceDraft } from "@/components/chat/chat-widget/types";
import { getSupportedRecorderMimeType } from "@/components/chat/chat-widget/utils";

type StartChatWidgetVoiceRecordingParams = {
  existingVoiceDraft: VoiceDraft | null;
  mediaRecorderRef: React.MutableRefObject<MediaRecorder | null>;
  mediaStreamRef: React.MutableRefObject<MediaStream | null>;
  recordingStartedAtRef: React.MutableRefObject<number | null>;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
  setIsRecordingVoice: React.Dispatch<React.SetStateAction<boolean>>;
  setRecordingStartedAt: React.Dispatch<React.SetStateAction<number | null>>;
  setVoiceDraft: React.Dispatch<React.SetStateAction<VoiceDraft | null>>;
  stopVoiceCapture: () => void;
  voiceChunksRef: React.MutableRefObject<Blob[]>;
};

export async function startChatWidgetVoiceRecording({
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
}: StartChatWidgetVoiceRecordingParams) {
  const mimeType = getSupportedRecorderMimeType();

  if (mimeType === null) {
    setError("Ваш браузер не поддерживает запись голосовых сообщений.");
    return;
  }

  try {
    const { recorder, stream } = await createChatWidgetVoiceRecorder({
      mimeType,
    });

    initializeChatWidgetVoiceRecording({
      mediaRecorderRef,
      mediaStreamRef,
      recorder,
      recordingStartedAtRef,
      setError,
      setRecordingStartedAt,
      stream,
      voiceChunksRef,
    });

    attachChatWidgetVoiceDataHandler({
      recorder,
      voiceChunksRef,
    });

    attachChatWidgetVoiceErrorHandler({
      recorder,
      recordingStartedAtRef,
      setError,
      setIsRecordingVoice,
      setRecordingStartedAt,
      stopVoiceCapture,
    });

    attachChatWidgetVoiceStopHandler({
      existingVoiceDraft,
      mimeType,
      recorder,
      recordingStartedAtRef,
      setError,
      setIsRecordingVoice,
      setRecordingStartedAt,
      setVoiceDraft,
      stopVoiceCapture,
      voiceChunksRef,
    });

    recorder.start();
    setIsRecordingVoice(true);
  } catch (err) {
    console.error("Failed to start voice recording:", err);
    setError("Не удалось начать запись голосового сообщения.");
    stopVoiceCapture();
  }
}
