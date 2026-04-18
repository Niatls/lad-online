type InitializeChatWidgetVoiceRecordingParams = {
  mediaRecorderRef: React.MutableRefObject<MediaRecorder | null>;
  mediaStreamRef: React.MutableRefObject<MediaStream | null>;
  recorder: MediaRecorder;
  recordingStartedAtRef: React.MutableRefObject<number | null>;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
  setRecordingStartedAt: React.Dispatch<React.SetStateAction<number | null>>;
  stream: MediaStream;
  voiceChunksRef: React.MutableRefObject<Blob[]>;
};

export function initializeChatWidgetVoiceRecording({
  mediaRecorderRef,
  mediaStreamRef,
  recorder,
  recordingStartedAtRef,
  setError,
  setRecordingStartedAt,
  stream,
  voiceChunksRef,
}: InitializeChatWidgetVoiceRecordingParams) {
  mediaStreamRef.current = stream;
  mediaRecorderRef.current = recorder;
  voiceChunksRef.current = [];
  setError(null);

  const startedAt = Date.now();
  recordingStartedAtRef.current = startedAt;
  setRecordingStartedAt(startedAt);
}
