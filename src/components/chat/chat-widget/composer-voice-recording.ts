import { attachChatWidgetVoiceDataHandler } from "@/components/chat/chat-widget/attach-chat-widget-voice-data-handler";
import { attachChatWidgetVoiceErrorHandler } from "@/components/chat/chat-widget/attach-chat-widget-voice-error-handler";
import { attachChatWidgetVoiceStopHandler } from "@/components/chat/chat-widget/attach-chat-widget-voice-stop-handler";
import { createChatWidgetVoiceRecorder } from "@/components/chat/chat-widget/create-chat-widget-voice-recorder";
import { getSupportedRecorderMimeType } from "@/components/chat/chat-widget/utils";
import { initializeChatWidgetVoiceRecording } from "@/components/chat/chat-widget/initialize-chat-widget-voice-recording";

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
    setError("Р В Р’В Р вЂ™Р’В Р В Р вЂ Р В РІР‚С™Р РЋРЎв„ўР В Р’В Р вЂ™Р’В Р В Р Р‹Р Р†Р вЂљРЎС›Р В Р’В Р вЂ™Р’В Р В РІР‚в„ўР вЂ™Р’В»Р В Р’В Р вЂ™Р’В Р В Р Р‹Р Р†Р вЂљРЎС›Р В Р’В Р В Р вЂ№Р В Р’В Р РЋРІР‚СљР В Р’В Р вЂ™Р’В Р В Р Р‹Р Р†Р вЂљРЎС›Р В Р’В Р вЂ™Р’В Р В Р’В Р Р†Р вЂљР’В Р В Р’В Р В Р вЂ№Р В Р вЂ Р В РІР‚С™Р Р†РІР‚С›РІР‚вЂњР В Р’В Р вЂ™Р’В Р В РІР‚в„ўР вЂ™Р’Вµ Ռ В Р’В Р В Р вЂ№Ռ Վ Ռ’В Ռ ՌЋՌІՌ‚ՍљՌ Վ Ռ’В Ռ вЂ™Р’В Ռ В Ռ Ր‹Ռ Ր†Ռ вЂљՌЎС›Ռ Վ Ռ’В Ռ вЂ™Р’В Ռ Վ Ռ Ր‹Ռ Ր†Ռ вЂљՌЎС›Ռ Վ Ռ’В Ռ вЂ™Р’В Ռ Վ ՌІՌ‚в„ўՌ вЂ™Р’В±Ռ Վ Ռ’В Ռ Վ Ռ Ր‹Ռ Ր†Ռ вЂљՌ’В°Ռ Վ Ռ’В Ռ вЂ™Р’В Ռ Վ ՌІՌ‚в„ўՌ вЂ™Р’ВµՌ Վ Ռ’В Ռ вЂ™Р’В Ռ Վ Ռ’В Ռ Р†Ռ вЂљՌ’В¦Ռ Վ Ռ’В Ռ вЂ™Р’В Ռ Վ Ռ Ր‹Ռ Ր†Ռ вЂљՌ’ВՌ Վ Ռ’В Ռ Վ Ռ Ր‹Ռ Ւ Ռ’В Ռ Վ Ռ ՌЏ Ռ Վ Ռ’В Ռ вЂ™Р’В Ռ Վ Ռ’В Ռ Р†Ռ вЂљՌ’В¦Ռ Վ Ռ’В Ռ вЂ™Р’В Ռ Վ ՌІՌ‚в„ўՌ вЂ™Р’Вµ Ռ Վ Ռ’В Ռ вЂ™Р’В Ռ Վ Ռ Ր‹Ռ Ր†Ռ вЂљՌІՌ‚ՍњՌ Վ Ռ’В Ռ вЂ™Р’В Ռ Վ Ռ Ր‹Ռ Ր†Ռ вЂљՌЎС›Ռ Վ Ռ’В Ռ вЂ™Р’В Ռ Վ ՌЎС›Ռ Ր†Ռ вЂљՌ’ВՌ Վ Ռ’В Ռ вЂ™Р’В Ռ Վ ՌЎС›Ռ Ր†Ռ вЂљՌ’ВՌ Վ Ռ’В Ռ вЂ™Р’В Ռ Վ ՌІՌ‚в„ўՌ вЂ™Р’ВµՌ Վ Ռ’В Ռ Վ Ռ Ր‹Ռ Ւ Ռ’В Ռ Ռ†Ռ вЂљՌЎв„ўՌ Վ Ռ’В Ռ вЂ™Р’В Ռ Վ ՌІՌ‚в„ўՌ вЂ™Р’В¶Ռ Վ Ռ’В Ռ вЂ™Р’В Ռ Վ Ռ Ր‹Ռ Ր†Ռ вЂљՌ’ВՌ Վ Ռ’В Ռ вЂ™Р’В Ռ Վ Ռ’В Ռ Р†Ռ вЂљՌ’В Ռ Վ Ռ’В Ռ вЂ™Р’В Ռ Վ ՌІՌ‚в„ўՌ вЂ™Р’В°Ռ Վ Ռ’В Ռ Վ Ռ Ր‹Ռ Ւ Ռ’В Ռ Ռ†Ռ вЂљՌІвЂћвЂ“Ռ Վ Ռ’В Ռ Վ Ռ Ր‹Ռ Վ Ռ вЂ Ռ Վ ՌІՌ‚Ս™Ռ ՌЋՌІвЂћСћՌ Վ Ռ’В Ռ Վ Ռ Ր‹Ռ Վ Ռ’В Ռ ՌЋՌІՌ‚ՍљՌ Վ Ռ’В Ռ Վ Ռ Ր‹Ռ Վ Ռ’В Ռ Վ Ռ ՌЏ Ռ Վ Ռ’В Ռ вЂ™Р’В Ռ Վ Ռ’В Ռ Р†Ռ вЂљՌ’В  ՌҐРЉР’В Ռ Վ Ռ Ր‹Ռ Վ Ռ’В Ռ Վ Ռ вЂ°Ռ Վ Ռ’В Ռ Վ Ռ Ր‹Ռ Վ Ռ вЂ Ռ Վ ՌІՌ‚Ս™Ռ ՌЋՌІвЂћСћՌ Վ Ռ’В Ռ вЂ™Р’В Ռ Վ Ռ Ր‹Ռ Ւ Ռ’В Ռ Ռ†Ռ вЂљՌЎС›Ռ Վ Ռ’В Ռ вЂ™Р’В Ռ Վ Ռ Ր‹Ռ вЂ™Р’В ՌҐРЉР’В Ռ вЂ™Р’В Ռ Վ ՌІՌ‚в„ўՌ вЂ™Р’В±Ռ Վ Ռ’В Ռ Վ Ռ Ր‹Ռ Ւ Ռ’В Ռ Ռ†Ռ вЂљՌЎв„ўՌ Վ Ռ’В Ռ вЂ™Р’В Ռ Վ ՌІՌ‚в„ўՌ вЂ™Р’В°Ռ Վ Ռ’В Ռ Վ Ռ Ր‹Ռ ՌЋՌІՌ‚ՍљՌ Վ Ռ’В Ռ вЂ™Р’В Ռ Վ ՌІՌ‚в„ўՌ вЂ™Р’В·Ռ Վ Ռ’В Ռ вЂ™Р’В Ռ Վ ՌІՌ‚в„ўՌ вЂ™Р’ВµՌ Վ Ռ’В Ռ Վ Ռ Ր‹Ռ Ւ Ռ’В Ռ Ռ†Ռ вЂљՌЎв„ўՌ Վ Ռ’В Ռ вЂ™Р’В Ռ Վ ՌІՌ‚в„ўՌ вЂ™Р’Вµ.");
    return;
  }

  try {
    const { recorder, stream } = await createChatWidgetVoiceRecorder({ mimeType });

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
    setError("Р В Р’В Р вЂ™Р’В Р Վ Ռ Ր‹Ռ ՌЋՌЎв„ўՌ Վ Ռ’В Ռ вЂ™Р’В Ռ Վ ՌІՌ‚в„ўՌ вЂ™Р’Вµ ՌҐРЉР’В ՌҐРЉՌ вЂ№Ռ Վ Ռ Ր‹Ռ Ր†Ռ вЂљՌЎС™Ռ Վ Ռ’В ՌҐՌ‹Ռ’В ՌҐРЉՌЎС›Ռ Ր†Ռ вЂљՌ’ВՌ Վ Ռ’В ՌҐՌ‹Ռ’В ՌҐРЉՌІՌ‚в„ўՌ вЂ™Р’В°Ռ Վ Ռ’В ՌҐՌ‹Ռ’В ՌҐРЉՌІՌ‚в„ўՌ вЂ™Р’В»Ռ Վ Ռ’В ՌҐՌ‹Ռ’В ՌҐРЉՌ Ր‹Ռ Ր†Ռ вЂљՌЎС›Ռ Վ Ռ’В ՌҐՌЉՌ вЂ№ՌҐРЉՌ Ր‹Ռ’В ՌҐՌЉՌ вЂ№ՌҐРЉՌ вЂ Ռ Վ ՌІՌ‚Ս™ՌҐРЉՌ вЂ№ՌҐРЉՌ’В ՌҐՌ‹Ռ’В ՌҐРЉՌ Ր‹Ռ Ր†Ռ вЂљՌ’ВՌҐРЉՌ’В ՌҐՌЉՌ вЂ№ՌҐРЉՌ вЂ ՌҐРЉՌІՌ‚Ս™ՌҐՌЊՌІвЂћСћՌҐРЉՌ’В ՌҐՌЉՌ вЂ№ՌҐРЉՌ В ՌІՌ‚В° ՌҐРЉՌ’В ՌҐՌ‹Ռ’В ՌҐРЉՌЎС›Ռ Ր†Ռ вЂљՌ’ВՌҐРЉՌ’В ՌҐՌ‹Ռ’В ՌҐРЉՌ Ր‹Ռ Ր†Ռ вЂљՌЎС›ՌҐРЉՌ’В ՌҐՌЉՌ вЂ№ՌҐРЉՌ Ր‹Ռ’В ՌҐՌЉՌ вЂ№ՌҐРЉՌ вЂ ՌҐРЉՌІՌ‚Ս™ՌҐՌЌՌІвЂћСћՌҐРЉՌ’В ՌҐՌЉՌ вЂ№ՌҐРЉՌ Ր‹Ռ Ր†Ռ вЂљՌЎС™ՌҐРЉՌ’В ՌҐՌ‹Ռ’В ՌҐРЉՌ Ր‹Ռ Ր†Ռ вЂљՌІՌ‚Սњ ՌҐРЉՌ’В ՌҐՌ‹Ռ’В ՌҐРЉՌ Ր‹Ռ Ր†Ռ вЂљՌЎСљ ՌҐРЉՌ’В ՌҐՌ‹Ռ’В ՌҐРЉՌ Ր‹Ռ вЂ™Р’ВՌҐРЉՌ’В ՌҐՌ‹Ռ’В ՌҐРЉՌ Ր‹Ռ Ր†Ռ вЂљՌ’ВՌҐРЉՌ’В ՌҐՌ‹Ռ’В ՌҐРЉՌ Ր‹Ռ Ր†Ռ вЂљՌЎСљՌҐРЉՌ’В ՌҐՌЉՌ вЂ№ՌҐРЉՌ Ր†Ռ вЂљՌЎв„ўՌҐРЉՌ’В ՌҐՌ‹Ռ’В ՌҐРЉՌ Ր‹Ռ Ր†Ռ вЂљՌЎС›ՌҐРЉՌ’В ՌҐՌЉՌ вЂ№ՌҐРЉՌ вЂ ՌҐРЉՌІՌ‚Ս™ՌҐՌЌՌІՌ‚Ս”ՌҐРЉՌ’В ՌҐՌ‹Ռ’В ՌҐРЉՌ Ր‹Ռ Ր†Ռ вЂљՌЎС›ՌҐРЉՌ’В ՌҐՌ‹Ռ’В ՌҐРЉՌ’В Ռ Р†Ռ вЂљՌ’В¦ՌҐРЉՌ’В ՌҐՌЉՌ вЂ№ՌҐРЉՌ Ր‹Ռ Ր†Ռ вЂљՌЎС™.");
    stopVoiceCapture();
  }
}
