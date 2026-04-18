type AttachChatWidgetVoiceErrorHandlerParams = {
  recorder: MediaRecorder;
  recordingStartedAtRef: React.MutableRefObject<number | null>;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
  setIsRecordingVoice: React.Dispatch<React.SetStateAction<boolean>>;
  setRecordingStartedAt: React.Dispatch<React.SetStateAction<number | null>>;
  stopVoiceCapture: () => void;
};

export function attachChatWidgetVoiceErrorHandler({
  recorder,
  recordingStartedAtRef,
  setError,
  setIsRecordingVoice,
  setRecordingStartedAt,
  stopVoiceCapture,
}: AttachChatWidgetVoiceErrorHandlerParams) {
  recorder.onerror = () => {
    setError("Не удалось записать голосовое сообщение.");
    setIsRecordingVoice(false);
    setRecordingStartedAt(null);
    recordingStartedAtRef.current = null;
    stopVoiceCapture();
  };
}
