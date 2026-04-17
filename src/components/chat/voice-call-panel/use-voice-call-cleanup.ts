"use client";

import { useCallback } from "react";

import { resetVoiceConnectionStats } from "./stats";

type UseVoiceCallCleanupParams = {
  callEstablishedRef: React.MutableRefObject<boolean>;
  clearPendingLastEvent: () => void;
  clearReconnectTimeout: () => void;
  cleanupDestroyPeerConnection: () => void;
  closedRef: React.MutableRefObject<boolean>;
  localStreamRef: React.MutableRefObject<MediaStream | null>;
  pollRef: React.MutableRefObject<ReturnType<typeof setInterval> | undefined>;
  releaseWakeLock: () => Promise<void>;
  reconnectingRef: React.MutableRefObject<boolean>;
  resetDurationTracking: () => void;
  setIceRoute: React.Dispatch<React.SetStateAction<string>>;
  setIsReconnecting: React.Dispatch<React.SetStateAction<boolean>>;
  setTrafficRouteLabel: React.Dispatch<React.SetStateAction<string>>;
  setUsageBytes: React.Dispatch<React.SetStateAction<number>>;
  statsRef: React.MutableRefObject<ReturnType<typeof setInterval> | undefined>;
  stopKeepAliveAudio: () => void;
  syncMediaSession: (state: "none" | "active") => void;
};

export function useVoiceCallCleanup({
  callEstablishedRef,
  clearPendingLastEvent,
  clearReconnectTimeout,
  cleanupDestroyPeerConnection,
  closedRef,
  localStreamRef,
  pollRef,
  releaseWakeLock,
  reconnectingRef,
  resetDurationTracking,
  setIceRoute,
  setIsReconnecting,
  setTrafficRouteLabel,
  setUsageBytes,
  statsRef,
  stopKeepAliveAudio,
  syncMediaSession,
}: UseVoiceCallCleanupParams) {
  return useCallback(() => {
    if (closedRef.current) {
      return;
    }

    closedRef.current = true;
    clearReconnectTimeout();
    clearPendingLastEvent();

    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = undefined;
    }

    if (statsRef.current) {
      clearInterval(statsRef.current);
      statsRef.current = undefined;
    }

    reconnectingRef.current = false;
    setIsReconnecting(false);
    cleanupDestroyPeerConnection();
    void releaseWakeLock();
    stopKeepAliveAudio();
    syncMediaSession("none");

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }

    callEstablishedRef.current = false;
    resetDurationTracking();
    resetVoiceConnectionStats(setUsageBytes, setIceRoute, setTrafficRouteLabel);
  }, [
    callEstablishedRef,
    clearPendingLastEvent,
    clearReconnectTimeout,
    cleanupDestroyPeerConnection,
    closedRef,
    localStreamRef,
    pollRef,
    releaseWakeLock,
    reconnectingRef,
    resetDurationTracking,
    setIceRoute,
    setIsReconnecting,
    setTrafficRouteLabel,
    setUsageBytes,
    statsRef,
    stopKeepAliveAudio,
    syncMediaSession,
  ]);
}
