"use client";

import { useCallback } from "react";

import {
  releaseVoiceWakeLock,
  requestVoiceWakeLock,
  startVoiceKeepAliveAudio,
  stopVoiceKeepAliveAudio,
  syncVoiceMediaSession,
} from "./media";
import { postVoiceEventLog, postVoiceSignal } from "./signaling";
import { collectVoiceConnectionStats } from "./stats";
import type { WakeLockSentinelLike } from "./types";

type UseVoiceCallMediaControlsParams = {
  keepAliveAudioRef: React.MutableRefObject<HTMLAudioElement | null>;
  onCloseRef: React.MutableRefObject<() => void>;
  peerRef: React.MutableRefObject<RTCPeerConnection | null>;
  role: "admin" | "visitor";
  setIceRoute: React.Dispatch<React.SetStateAction<string>>;
  setTrafficRouteLabel: React.Dispatch<React.SetStateAction<string>>;
  setUsageBytes: React.Dispatch<React.SetStateAction<number>>;
  title: string;
  token: string;
  wakeLockRef: React.MutableRefObject<WakeLockSentinelLike | null>;
};

export function useVoiceCallMediaControls({
  keepAliveAudioRef,
  onCloseRef,
  peerRef,
  role,
  setIceRoute,
  setTrafficRouteLabel,
  setUsageBytes,
  title,
  token,
  wakeLockRef,
}: UseVoiceCallMediaControlsParams) {
  const stopKeepAliveAudio = useCallback(() => {
    stopVoiceKeepAliveAudio(keepAliveAudioRef);
  }, [keepAliveAudioRef]);

  const startKeepAliveAudio = useCallback(async () => {
    await startVoiceKeepAliveAudio(keepAliveAudioRef);
  }, [keepAliveAudioRef]);

  const syncMediaSession = useCallback(
    (state: "none" | "active") => {
      syncVoiceMediaSession({
        state,
        title,
        role,
        onClose: onCloseRef.current,
        startKeepAliveAudio,
      });
    },
    [onCloseRef, role, startKeepAliveAudio, title],
  );

  const releaseWakeLock = useCallback(async () => {
    await releaseVoiceWakeLock(wakeLockRef);
  }, [wakeLockRef]);

  const requestWakeLock = useCallback(async () => {
    await requestVoiceWakeLock(wakeLockRef);
  }, [wakeLockRef]);

  const postSignal = useCallback(
    async (signalType: string, payload: unknown) => {
      await postVoiceSignal(token, role, signalType, payload);
    },
    [role, token],
  );

  const postVoiceEvent = useCallback(
    async (eventType: string, message: string, details?: unknown) => {
      await postVoiceEventLog(token, role, eventType, message, details);
    },
    [role, token],
  );

  const refreshConnectionStats = useCallback(async () => {
    const pc = peerRef.current;
    if (!pc) {
      return;
    }

    try {
      const snapshot = await collectVoiceConnectionStats(pc);
      setUsageBytes(snapshot.usageBytes);
      setIceRoute(snapshot.iceRoute);
      setTrafficRouteLabel(snapshot.trafficRouteLabel);
    } catch (statsError) {
      console.error("Failed to refresh WebRTC stats:", statsError);
    }
  }, [peerRef, setIceRoute, setTrafficRouteLabel, setUsageBytes]);

  return {
    stopKeepAliveAudio,
    startKeepAliveAudio,
    syncMediaSession,
    releaseWakeLock,
    requestWakeLock,
    postSignal,
    postVoiceEvent,
    refreshConnectionStats,
  };
}
