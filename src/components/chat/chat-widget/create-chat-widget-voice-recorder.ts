type CreateChatWidgetVoiceRecorderParams = {
  mimeType: string | null;
};

type CreateChatWidgetVoiceRecorderResult = {
  recorder: MediaRecorder;
  stream: MediaStream;
};

export async function createChatWidgetVoiceRecorder({
  mimeType,
}: CreateChatWidgetVoiceRecorderParams): Promise<CreateChatWidgetVoiceRecorderResult> {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);

  return { recorder, stream };
}
