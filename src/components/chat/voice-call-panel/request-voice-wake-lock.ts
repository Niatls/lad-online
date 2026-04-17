import type { WakeLockSentinelLike } from "./types";

type WakeLockRefLike = {
  current: WakeLockSentinelLike | null;
};

export async function requestVoiceWakeLock(wakeLockRef: WakeLockRefLike) {
  if (typeof navigator === "undefined" || document.visibilityState !== "visible") {
    return;
  }

  const wakeLockApi = (navigator as Navigator & {
    wakeLock?: {
      request: (type: "screen") => Promise<WakeLockSentinelLike>;
    };
  }).wakeLock;

  if (!wakeLockApi) {
    return;
  }

  if (wakeLockRef.current && !wakeLockRef.current.released) {
    return;
  }

  try {
    wakeLockRef.current = await wakeLockApi.request("screen");
  } catch {
    // wake lock is best effort only
  }
}
