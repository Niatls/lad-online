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
    setError("Р вЂњР С•Р В»Р С•РЎРѓР С•Р Р†РЎвЂ№Р Вµ РЎРѓР С•Р С•Р В±РЎвЂ°Р ВµР Р…Р С‘РЎРЏ Р Р…Р Вµ Р С—Р С•Р Т‘Р Т‘Р ВµРЎР‚Р В¶Р С‘Р Р†Р В°РЎР‹РЎвЂљРЎРѓРЎРЏ Р Р† РЎРЊРЎвЂљР С•Р С Р В±РЎР‚Р В°РЎС“Р В·Р ВµРЎР‚Р Вµ.");
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

    recorder.onerror = () => {
      setError("Р СњР Вµ РЎС“Р Т‘Р В°Р В»Р С•РЎРѓРЎРЉ Р В·Р В°Р С—Р С‘РЎРѓР В°РЎвЂљРЎРЉ Р С–Р С•Р В»Р С•РЎРѓР С•Р Р†Р С•Р Вµ РЎРѓР С•Р С•Р В±РЎвЂ°Р ВµР Р…Р С‘Р Вµ.");
      setIsRecordingVoice(false);
      setRecordingStartedAt(null);
      recordingStartedAtRef.current = null;
      stopVoiceCapture();
    };

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
    setError("Р СњР Вµ РЎС“Р Т‘Р В°Р В»Р С•РЎРѓРЎРЉ Р С—Р С•Р В»РЎС“РЎвЂЎР С‘РЎвЂљРЎРЉ Р Т‘Р С•РЎРѓРЎвЂљРЎС“Р С— Р С” Р СР С‘Р С”РЎР‚Р С•РЎвЂћР С•Р Р…РЎС“.");
    stopVoiceCapture();
  }
}
