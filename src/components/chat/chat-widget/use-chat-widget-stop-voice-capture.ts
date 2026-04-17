import { useCallback, useEffect } from "react";

type UseChatWidgetStopVoiceCaptureParams = {
  mediaRecorderRef: React.MutableRefObject<MediaRecorder | null>;
  mediaStreamRef: React.MutableRefObject<MediaStream | null>;
};

export function useChatWidgetStopVoiceCapture({
  mediaRecorderRef,
  mediaStreamRef,
}: UseChatWidgetStopVoiceCaptureParams) {
  const stopVoiceCapture = useCallback(() => {
    mediaRecorderRef.current?.stream.getTracks().forEach((track) => track.stop());
    mediaRecorderRef.current = null;
    mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
    mediaStreamRef.current = null;
  }, [mediaRecorderRef, mediaStreamRef]);

  useEffect(() => () => stopVoiceCapture(), [stopVoiceCapture]);

  return stopVoiceCapture;
}
