import { attachChatWidgetVoiceErrorHandler } from "@/components/chat/chat-widget/attach-chat-widget-voice-error-handler";
import { attachChatWidgetVoiceStopHandler } from "@/components/chat/chat-widget/attach-chat-widget-voice-stop-handler";
import { createChatWidgetVoiceRecorder } from "@/components/chat/chat-widget/create-chat-widget-voice-recorder";
import { getSupportedRecorderMimeType } from "@/components/chat/chat-widget/utils";

type StartChatWidgetVoiceRecordingParams = {
  mediaRecorderRef: React.MutableRefObject<MediaRecorder | null>;
  mediaStreamRef: React.MutableRefObject<MediaStream | null>;
  recordingStartedAtRef: React.MutableRefObject<number | null>;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
  setIsRecordingVoice: React.Dispatch<React.SetStateAction<boolean>>;
  setRecordingStartedAt: React.Dispatch<React.SetStateAction<number | null>>;
  stopVoiceCapture: () => void;
  uploadVoiceMessage: (blob: Blob, durationMs: number) => Promise<void>;
  voiceChunksRef: React.MutableRefObject<Blob[]>;
};

export async function startChatWidgetVoiceRecording({
  mediaRecorderRef,
  mediaStreamRef,
  recordingStartedAtRef,
  setError,
  setIsRecordingVoice,
  setRecordingStartedAt,
  stopVoiceCapture,
  uploadVoiceMessage,
  voiceChunksRef,
}: StartChatWidgetVoiceRecordingParams) {
  const mimeType = getSupportedRecorderMimeType();
  if (mimeType === null) {
    setError("Р В РІР‚СљР В РЎвЂўР В Р’В»Р В РЎвЂўР РЋР С“Р В РЎвЂўР В Р вЂ Р РЋРІР‚в„–Р В Р’Вµ Р РЋР С“Р В РЎвЂўР В РЎвЂўР В Р’В±Р РЋРІР‚В°Р В Р’ВµР В Р вЂ¦Р В РЎвЂР РЋР РЏ Р В Р вЂ¦Р В Р’Вµ Р В РЎвЂ”Р В РЎвЂўР В РўвЂР В РўвЂР В Р’ВµР РЋР вЂљР В Р’В¶Р В РЎвЂР В Р вЂ Р В Р’В°Р РЋР вЂ№Р РЋРІР‚С™Р РЋР С“Р РЋР РЏ Р В Р вЂ  Ռ РЋР РЉР РЋРІР‚С™Р В РЎвЂўР В РЎВ Ռ В Р’В±Р РЋР вЂљР В Р’В°Р РЋРЎвЂњР В Р’В·Р В Р’ВµР РЋР вЂљР В Р’Вµ.");
    return;
  }

  try {
    const { recorder, stream } = await createChatWidgetVoiceRecorder({ mimeType });
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

    attachChatWidgetVoiceErrorHandler({
      recorder,
      recordingStartedAtRef,
      setError,
      setIsRecordingVoice,
      setRecordingStartedAt,
      stopVoiceCapture,
    });

    attachChatWidgetVoiceStopHandler({
      mimeType,
      recorder,
      recordingStartedAtRef,
      setError,
      setRecordingStartedAt,
      stopVoiceCapture,
      uploadVoiceMessage,
      voiceChunksRef,
    });

    recorder.start();
    setIsRecordingVoice(true);
  } catch (err) {
    console.error("Failed to start voice recording:", err);
    setError("Р В РЎСљР В Р’Вµ Ռ ՌЋРЎвЂњР Վ ՌўвЂР Վ Ռ’В°Р Վ Ռ’В»Р Վ ՌЎвЂўР ՌЋՌС“Ռ ՌЋՌР‰ Ռ Վ ՌЎвЂ”Ռ Վ ՌЎвЂўՌ Վ Ռ’В»Ռ ՌЋՌЎвЂњՌ ՌЋՌІР‚ՌЋՌ Վ ՌЎвЂՌ ՌЋՌІՌ‚Ս™Ռ ՌЋՌР‰ Ռ Վ ՌўвЂՌ Վ ՌЎвЂўՌ ՌЋՌС“Ռ ՌЋՌІՌ‚Ս™Ռ ՌЋՌЎвЂњՌ Վ ՌЎвЂ” Ռ Վ ՌЎвЂќ Ռ Վ ՌЎВՌ Վ ՌЎвЂՌ Վ ՌЎвЂќՌ ՌЋՌвЂљՌ Վ ՌЎвЂўՌ ՌЋՌІՌ‚Ս›Ռ Վ ՌЎвЂўՌ Վ Ռ вЂ¦Ռ ՌЋՌЎвЂњ.");
    stopVoiceCapture();
  }
}
