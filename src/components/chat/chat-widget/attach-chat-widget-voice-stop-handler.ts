import type { VoiceDraft } from "@/components/chat/chat-widget/types";

type AttachChatWidgetVoiceStopHandlerParams = {
  existingVoiceDraft: VoiceDraft | null;
  mimeType: string | null;
  recorder: MediaRecorder;
  recordingStartedAtRef: React.MutableRefObject<number | null>;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
  setIsRecordingVoice: React.Dispatch<React.SetStateAction<boolean>>;
  setRecordingStartedAt: React.Dispatch<React.SetStateAction<number | null>>;
  setVoiceDraft: React.Dispatch<React.SetStateAction<VoiceDraft | null>>;
  stopVoiceCapture: () => void;
  voiceChunksRef: React.MutableRefObject<Blob[]>;
};

export function attachChatWidgetVoiceStopHandler({
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
}: AttachChatWidgetVoiceStopHandlerParams) {
  recorder.onstop = async () => {
    const durationMs = Math.max(
      1000,
      Date.now() - (recordingStartedAtRef.current ?? Date.now())
    );
    const blob = new Blob(voiceChunksRef.current, {
      type: recorder.mimeType || mimeType || "audio/webm",
    });

    voiceChunksRef.current = [];
    setIsRecordingVoice(false);
    setRecordingStartedAt(null);
    recordingStartedAtRef.current = null;
    stopVoiceCapture();

    if (blob.size === 0) {
      setError("Не удалось сохранить запись.");
      return;
    }

    const nextMimeType =
      recorder.mimeType || mimeType || existingVoiceDraft?.mimeType || "audio/webm";

    setVoiceDraft(
      existingVoiceDraft
        ? {
            blob: new Blob([existingVoiceDraft.blob, blob], {
              type: nextMimeType,
            }),
            durationMs: existingVoiceDraft.durationMs + durationMs,
            mimeType: nextMimeType,
          }
        : {
            blob,
            durationMs,
            mimeType: nextMimeType,
          }
    );
  };
}
