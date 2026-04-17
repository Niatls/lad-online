type ComposerRecordingStatusProps = {
  isRecordingVoice: boolean;
  recordingStartedAt: number | null;
  formatTime: (date: string) => string;
};

export function ComposerRecordingStatus({
  isRecordingVoice,
  recordingStartedAt,
  formatTime,
}: ComposerRecordingStatusProps) {
  if (isRecordingVoice) {
    return (
      <p className="mt-3 text-[11px] font-bold text-red-500">
        {
          "\u0417\u0430\u043f\u0438\u0441\u044c \u0438\u0434\u0451\u0442. \u041d\u0430\u0436\u043c\u0438\u0442\u0435 \u043a\u0432\u0430\u0434\u0440\u0430\u0442, \u0447\u0442\u043e\u0431\u044b \u043e\u0442\u043f\u0440\u0430\u0432\u0438\u0442\u044c \u0433\u043e\u043b\u043e\u0441\u043e\u0432\u043e\u0435 \u0441\u043e\u043e\u0431\u0449\u0435\u043d\u0438\u0435."
        }
      </p>
    );
  }

  if (!recordingStartedAt) {
    return null;
  }

  return (
    <p className="mt-3 text-[11px] text-forest/40">
      {"\u041d\u0430\u0447\u0430\u043b\u043e \u0437\u0430\u043f\u0438\u0441\u0438: "}
      {formatTime(new Date(recordingStartedAt).toISOString())}
    </p>
  );
}
