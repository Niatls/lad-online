import type { WakeLockSentinelLike } from "./types";

type WakeLockRefLike = {
  current: WakeLockSentinelLike | null;
};

export async function releaseVoiceWakeLock(wakeLockRef: WakeLockRefLike) {
  const sentinel = wakeLockRef.current;
  wakeLockRef.current = null;

  if (!sentinel || sentinel.released) {
    return;
  }

  try {
    await sentinel.release();
  } catch {
    // ignore wake lock release failures
  }
}
