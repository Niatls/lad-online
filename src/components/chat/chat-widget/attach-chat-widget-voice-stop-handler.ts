type AttachChatWidgetVoiceStopHandlerParams = {
  mimeType: string | null;
  recorder: MediaRecorder;
  recordingStartedAtRef: React.MutableRefObject<number | null>;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
  setRecordingStartedAt: React.Dispatch<React.SetStateAction<number | null>>;
  stopVoiceCapture: () => void;
  uploadVoiceMessage: (blob: Blob, durationMs: number) => Promise<void>;
  voiceChunksRef: React.MutableRefObject<Blob[]>;
};

export function attachChatWidgetVoiceStopHandler({
  mimeType,
  recorder,
  recordingStartedAtRef,
  setError,
  setRecordingStartedAt,
  stopVoiceCapture,
  uploadVoiceMessage,
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
    setRecordingStartedAt(null);
    recordingStartedAtRef.current = null;
    stopVoiceCapture();

    if (blob.size === 0) {
      setError("Не удалось сохранить запись.");
      return;
    }

    await uploadVoiceMessage(blob, durationMs);
  };
}
