"use client";

import { useEffect } from "react";

import { createVoiceForegroundRecoveryHandlers } from "./recovery";

type UseVoiceCallRecoveryHandlersParams = {
  attemptReconnect: () => Promise<void>;
  closedRef: React.MutableRefObject<boolean>;
  endingRef: React.MutableRefObject<boolean>;
  localStreamRef: React.MutableRefObject<MediaStream | null>;
  pauseDurationTracking: () => void;
  postVoiceEvent: (eventType: string, message: string, details?: unknown) => Promise<void>;
  reconnectAllowedRef: React.MutableRefObject<boolean>;
  requestWakeLock: () => Promise<void>;
  restoreAudioAfterInterruption: (reason: string) => Promise<void>;
  setStatus: React.Dispatch<React.SetStateAction<string>>;
  shouldAttemptRecovery: () => boolean;
  startKeepAliveAudio: () => Promise<void>;
  syncMediaSession: (state: "none" | "active") => void;
  token: string;
  updateLastEvent: (message: string, force?: boolean) => void;
};

export function useVoiceCallRecoveryHandlers({
  attemptReconnect,
  closedRef,
  endingRef,
  localStreamRef,
  pauseDurationTracking,
  postVoiceEvent,
  reconnectAllowedRef,
  requestWakeLock,
  restoreAudioAfterInterruption,
  setStatus,
  shouldAttemptRecovery,
  startKeepAliveAudio,
  syncMediaSession,
  token,
  updateLastEvent,
}: UseVoiceCallRecoveryHandlersParams) {
  useEffect(() => {
    if (!token) {
      return;
    }

    const { handleForegroundRecovery, handleOnline, handleOffline } = createVoiceForegroundRecoveryHandlers({
      closedRef,
      endingRef,
      localStreamRef,
      reconnectAllowedRef,
      updateLastEvent,
      postVoiceEvent,
      setStatus,
      pauseDurationTracking,
      requestWakeLock,
      startKeepAliveAudio,
      syncMediaSession,
      restoreAudioAfterInterruption,
      shouldAttemptRecovery,
      attemptReconnect,
    });

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    window.addEventListener("focus", handleForegroundRecovery);
    window.addEventListener("pageshow", handleForegroundRecovery);
    document.addEventListener("visibilitychange", handleForegroundRecovery);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("focus", handleForegroundRecovery);
      window.removeEventListener("pageshow", handleForegroundRecovery);
      document.removeEventListener("visibilitychange", handleForegroundRecovery);
    };
  }, [
    attemptReconnect,
    closedRef,
    endingRef,
    localStreamRef,
    pauseDurationTracking,
    postVoiceEvent,
    reconnectAllowedRef,
    requestWakeLock,
    restoreAudioAfterInterruption,
    setStatus,
    shouldAttemptRecovery,
    startKeepAliveAudio,
    syncMediaSession,
    token,
    updateLastEvent,
  ]);
}
