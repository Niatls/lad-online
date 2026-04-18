type ChatWidgetComposerRecordingStatusProps = {
  isRecordingVoice: boolean;
  recordingStartedAt: number | null;
};

export function ChatWidgetComposerRecordingStatus({
  isRecordingVoice,
  recordingStartedAt,
}: ChatWidgetComposerRecordingStatusProps) {
  if (isRecordingVoice) {
    return (
      <p className="mt-2 text-center text-[11px] font-bold text-red-500">
        Идёт запись. Нажмите квадрат, чтобы отправить голосовое.
      </p>
    );
  }

  if (recordingStartedAt) {
    return (
      <p className="mt-2 text-center text-[11px] text-forest/40">
        Начало записи:{" "}
        {new Date(recordingStartedAt).toLocaleTimeString("ru", {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </p>
    );
  }

  return null;
}
