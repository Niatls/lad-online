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
        РРґС‘С‚ Р·Р°РїРёСЃСЊ. РќР°Р¶РјРёС‚Рµ РєРІР°РґСЂР°С‚, С‡С‚РѕР±С‹ РѕС‚РїСЂР°РІРёС‚СЊ РіРѕР»РѕСЃРѕРІРѕРµ.
      </p>
    );
  }

  if (recordingStartedAt) {
    return (
      <p className="mt-2 text-center text-[11px] text-forest/40">
        РќР°С‡Р°Р»Рѕ Р·Р°РїРёСЃРё: {new Date(recordingStartedAt).toLocaleTimeString("ru", { hour: "2-digit", minute: "2-digit" })}
      </p>
    );
  }

  return null;
}
