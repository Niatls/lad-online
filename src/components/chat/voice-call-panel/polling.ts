import type { VoiceSignal } from "./types";

type PollVoiceSignalsParams = {
  token: string;
  role: "admin" | "visitor";
  lastSignalIdRef: { current: number };
  handleSignal: (signal: VoiceSignal) => Promise<void>;
  setStatus: (value: string) => void;
  setConnecting: (value: boolean) => void;
  updateLastEvent: (message: string, force?: boolean) => void;
  pauseDurationTracking: () => void;
  cleanup: () => void;
  onClose: () => void;
};

export async function pollVoiceSignals({
  token,
  role,
  lastSignalIdRef,
  handleSignal,
  setStatus,
  setConnecting,
  updateLastEvent,
  pauseDurationTracking,
  cleanup,
  onClose,
}: PollVoiceSignalsParams) {
  try {
    const res = await fetch(`/api/chat/voice/${token}/signals?after=${lastSignalIdRef.current}&role=${role}`);
    if (!res.ok) {
      return;
    }

    const signals: VoiceSignal[] = await res.json();
    for (const signal of signals) {
      lastSignalIdRef.current = Math.max(lastSignalIdRef.current, signal.id);
      await handleSignal(signal);
    }

    const inviteRes = await fetch(`/api/chat/voice/${token}`, { cache: "no-store" });
    if (inviteRes.status === 410 || inviteRes.status === 404) {
      setStatus("Звонок завершён");
      updateLastEvent("Invite завершён или истёк", true);
      setConnecting(false);
      pauseDurationTracking();
      cleanup();
      onClose();
    }
  } catch (pollError) {
    console.error("Voice signal polling failed:", pollError);
  }
}
