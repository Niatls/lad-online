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
    setError("Р В РЎСљР В Р’Вµ Р РЋРЎвЂњР В РўвЂР В Р’В°Р В Р’В»Р В РЎвЂўР РЋР С“Р РЋР Р‰ Р В Р’В·Р В Р’В°Р В РЎвЂ”Р В РЎвЂР РЋР С“Р В Р’В°Р РЋРІР‚С™Р РЋР Р‰ Р В РЎвЂ“Р В РЎвЂўР В Р’В»Р В РЎвЂўР РЋР С“Р В РЎвЂўР В Р вЂ Р В РЎвЂўР В Р’Вµ Р РЋР С“Р В РЎвЂўР В РЎвЂўР В Р’В±Р РЋРІР‚В°Р В Р’ВµР В Р вЂ¦Р В РЎвЂР В Р’Вµ.");
    setIsRecordingVoice(false);
    setRecordingStartedAt(null);
    recordingStartedAtRef.current = null;
    stopVoiceCapture();
  };
}
