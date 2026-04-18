type AttachChatWidgetVoiceDataHandlerParams = {
  recorder: MediaRecorder;
  voiceChunksRef: React.MutableRefObject<Blob[]>;
};

export function attachChatWidgetVoiceDataHandler({
  recorder,
  voiceChunksRef,
}: AttachChatWidgetVoiceDataHandlerParams) {
  recorder.ondataavailable = (event) => {
    if (event.data.size > 0) {
      voiceChunksRef.current.push(event.data);
    }
  };
}
