import { attachChatWidgetVoiceDataHandler } from "@/components/chat/chat-widget/attach-chat-widget-voice-data-handler";
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
    setError("Р В Р’В Р Р†Р вЂљРЎС™Р В Р’В Р РЋРІР‚СћР В Р’В Р вЂ™Р’В»Р В Р’В Р РЋРІР‚СћР В Р Р‹Р В РЎвЂњР В Р’В Р РЋРІР‚СћР В Р’В Р В РІР‚В Р В Р Р‹Р Р†Р вЂљРІвЂћвЂ“Р В Р’В Р вЂ™Р’Вµ Р В Р Р‹Р В РЎвЂњР В Р’В Р РЋРІР‚СћР В Р’В Р РЋРІР‚СћР В Р’В Р вЂ™Р’В±Р В Р Р‹Р Р†Р вЂљР’В°Р В Р’В Р вЂ™Р’ВµР В Р’В Р В РІР‚В¦Р В Р’В Р РЋРІР‚ВР В Р Р‹Р В Р РЏ Р В Р’В Р В РІР‚В¦Р В Р’В Р вЂ™Р’Вµ Р В Р’В Р РЋРІР‚вЂќР В Р’В Р РЋРІР‚СћР В Р’В Р СћРІР‚ВР В Р’В Р СћРІР‚ВР В Р’В Р вЂ™Р’ВµР В Р Р‹Р В РІР‚С™Р В Р’В Р вЂ™Р’В¶Р В Р’В Р РЋРІР‚ВР В Р’В Р В РІР‚В Р В Р’В Р вЂ™Р’В°Р В Р Р‹Р В РІР‚в„–Р В Р Р‹Р Р†Р вЂљРЎв„ўР В Р Р‹Р В РЎвЂњР В Р Р‹Р В Р РЏ Р В Р’В Р В РІР‚В  ХЊВ Р Р‹Р В Р Р‰Р В Р Р‹Р Р†Р вЂљРЎв„ўР В Р’В Р РЋРІР‚СћР В Р’В Р РЋР’В ХЊВ Р’В Р вЂ™Р’В±Р В Р Р‹Р В РІР‚С™Р В Р’В Р вЂ™Р’В°Р В Р Р‹Р РЋРІР‚СљР В Р’В Р вЂ™Р’В·Р В Р’В Р вЂ™Р’ВµР В Р Р‹Р В РІР‚С™Р В Р’В Р вЂ™Р’Вµ.");
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
    setError("Р В Р’В Р РЋРЎС™Р В Р’В Р вЂ™Р’Вµ ХЊВ ХЊР‹Р РЋРІР‚СљР В ХЋВ ХЊСћРІР‚ВР В ХЋВ ХЊвЂ™Р’В°Р В ХЋВ ХЊвЂ™Р’В»Р В ХЋВ ХЊРЋРІР‚СћР В ХЊР‹ХЊРЎвЂњХЊВ ХЊР‹ХЊР вЂ° ХЊВ ХЋВ ХЊРЋРІР‚вЂќХЊВ ХЋВ ХЊРЋРІР‚СћХЊВ ХЋВ ХЊвЂ™Р’В»ХЊВ ХЊР‹ХЊРЋРІР‚СљХЊВ ХЊР‹ХЊР†Р вЂљХЊР‹ХЊВ ХЋВ ХЊРЋРІР‚ВХЊВ ХЊР‹ХЊР†ХЊвЂљХЌв„ўХЊВ ХЊР‹ХЊР вЂ° ХЊВ ХЋВ ХЊСћРІР‚ВХЊВ ХЋВ ХЊРЋРІР‚СћХЊВ ХЊР‹ХЊРЎвЂњХЊВ ХЊР‹ХЊР†ХЊвЂљХЌв„ўХЊВ ХЊР‹ХЊРЋРІР‚СљХЊВ ХЋВ ХЊРЋРІР‚вЂќ ХЊВ ХЋВ ХЊРЋРІР‚Сњ ХЊВ ХЋВ ХЊРЋР’ВХЊВ ХЋВ ХЊРЋРІР‚ВХЊВ ХЋВ ХЊРЋРІР‚СњХЊВ ХЊР‹ХЊРІР‚С™ХЊВ ХЋВ ХЊРЋРІР‚СћХЊВ ХЊР‹ХЊР†ХЊвЂљХЌвЂєХЊВ ХЋВ ХЊРЋРІР‚СћХЊВ ХЋВ ХЊВ РІР‚В¦ХЊВ ХЊР‹ХЊРЋРІР‚Сљ.");
    stopVoiceCapture();
  }
}
