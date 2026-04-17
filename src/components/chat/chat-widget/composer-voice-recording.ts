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
    setError("Р“РѕР»РѕСЃРѕРІС‹Рµ СЃРѕРѕР±С‰РµРЅРёСЏ РЅРµ РїРѕРґРґРµСЂР¶РёРІР°СЋС‚СЃСЏ РІ СЌС‚РѕРј Р±СЂР°СѓР·РµСЂРµ.");
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
      setError("РќРµ СѓРґР°Р»РѕСЃСЊ Р·Р°РїРёСЃР°С‚СЊ РіРѕР»РѕСЃРѕРІРѕРµ СЃРѕРѕР±С‰РµРЅРёРµ.");
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
        setError("РќРµ СѓРґР°Р»РѕСЃСЊ СЃРѕС…СЂР°РЅРёС‚СЊ Р·Р°РїРёСЃСЊ.");
        return;
      }

      await uploadVoiceMessage(blob, durationMs);
    };

    recorder.start();
    setIsRecordingVoice(true);
  } catch (err) {
    console.error("Failed to start voice recording:", err);
    setError("РќРµ СѓРґР°Р»РѕСЃСЊ РїРѕР»СѓС‡РёС‚СЊ РґРѕСЃС‚СѓРї Рє РјРёРєСЂРѕС„РѕРЅСѓ.");
    stopVoiceCapture();
  }
}
