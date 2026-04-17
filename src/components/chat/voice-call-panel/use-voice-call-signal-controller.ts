"use client";

import { useCallback, useEffect } from "react";

import { attemptVoiceReconnect, shouldAttemptVoiceRecovery } from "./recovery";
import {
  handleIncomingVoiceSignal,
  handleVoiceVisitorRejoinRequest,
} from "./signal-handlers";
import { pollVoiceSignals } from "./polling";
import { resetVoiceConnectionStats } from "./stats";
import type { VoiceSignal } from "./types";

type UseVoiceCallSignalControllerParams = {
  attemptReconnectRef: React.MutableRefObject<(() => Promise<void>) | null>;
  callEstablishedRef: React.MutableRefObject<boolean>;
  clearPendingLastEvent: () => void;
  clearReconnectTimeout: () => void;
  cleanupDestroyPeerConnection: () => void;
  closedRef: React.MutableRefObject<boolean>;
  endingRef: React.MutableRefObject<boolean>;
  flushPendingCandidates: (pendingCandidatesRef: React.MutableRefObject<RTCIceCandidateInit[]>) => Promise<void>;
  handleVisitorRejoinRequestDeps: {
    rejoinHandledAtRef: React.MutableRefObject<number>;
    lastReconnectStartedAtRef: React.MutableRefObject<number>;
    pendingVisitorRejoinRef: React.MutableRefObject<boolean>;
    createPeerRef: React.MutableRefObject<(() => Promise<RTCPeerConnection | null>) | null>;
    sendOfferRef: React.MutableRefObject<((iceRestart?: boolean) => Promise<void>) | null>;
  };
  invokeCreatePeer: () => Promise<RTCPeerConnection | null>;
  invokeSendOffer: (iceRestart?: boolean) => Promise<void>;
  lastReconnectStartedAtRef: React.MutableRefObject<number>;
  lastSignalIdRef: React.MutableRefObject<number>;
  localStreamRef: React.MutableRefObject<MediaStream | null>;
  onCloseRef: React.MutableRefObject<() => void>;
  pauseDurationTracking: () => void;
  pendingCandidatesRef: React.MutableRefObject<RTCIceCandidateInit[]>;
  peerRef: React.MutableRefObject<RTCPeerConnection | null>;
  pollRef: React.MutableRefObject<ReturnType<typeof setInterval> | undefined>;
  postSignal: (signalType: string, payload: unknown) => Promise<void>;
  postVoiceEvent: (eventType: string, message: string, details?: unknown) => Promise<void>;
  reconnectAllowedRef: React.MutableRefObject<boolean>;
  reconnectAttemptsRef: React.MutableRefObject<number>;
  reconnectTimeoutRef: React.MutableRefObject<ReturnType<typeof setTimeout> | undefined>;
  reconnectingRef: React.MutableRefObject<boolean>;
  releaseWakeLock: () => Promise<void>;
  resetDurationTracking: () => void;
  role: "admin" | "visitor";
  setConnecting: React.Dispatch<React.SetStateAction<boolean>>;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
  setIceRoute: React.Dispatch<React.SetStateAction<string>>;
  setIsReconnecting: React.Dispatch<React.SetStateAction<boolean>>;
  setStatus: React.Dispatch<React.SetStateAction<string>>;
  setTrafficRouteLabel: React.Dispatch<React.SetStateAction<string>>;
  setUsageBytes: React.Dispatch<React.SetStateAction<number>>;
  startedReconnectRecently: (now?: number) => boolean;
  statsRef: React.MutableRefObject<ReturnType<typeof setInterval> | undefined>;
  stopKeepAliveAudio: () => void;
  syncMediaSession: (state: "none" | "active") => void;
  token: string;
  updateLastEvent: (message: string, force?: boolean) => void;
};

export function useVoiceCallSignalController({
  attemptReconnectRef,
  callEstablishedRef,
  clearPendingLastEvent,
  clearReconnectTimeout,
  cleanupDestroyPeerConnection,
  closedRef,
  endingRef,
  flushPendingCandidates,
  handleVisitorRejoinRequestDeps,
  invokeCreatePeer,
  invokeSendOffer,
  lastReconnectStartedAtRef,
  lastSignalIdRef,
  localStreamRef,
  onCloseRef,
  pauseDurationTracking,
  pendingCandidatesRef,
  peerRef,
  pollRef,
  postSignal,
  postVoiceEvent,
  reconnectAllowedRef,
  reconnectAttemptsRef,
  reconnectTimeoutRef,
  reconnectingRef,
  releaseWakeLock,
  resetDurationTracking,
  role,
  setConnecting,
  setError,
  setIceRoute,
  setIsReconnecting,
  setStatus,
  setTrafficRouteLabel,
  setUsageBytes,
  startedReconnectRecently,
  statsRef,
  stopKeepAliveAudio,
  syncMediaSession,
  token,
  updateLastEvent,
}: UseVoiceCallSignalControllerParams) {
  const cleanup = useCallback(() => {
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

  const handleVisitorRejoinRequest = useCallback(async () => {
    await handleVoiceVisitorRejoinRequest({
      ...handleVisitorRejoinRequestDeps,
      startedReconnectRecently,
      setStatus,
      updateLastEvent,
      invokeCreatePeer,
      invokeSendOffer,
    });
  }, [handleVisitorRejoinRequestDeps, invokeCreatePeer, invokeSendOffer, setStatus, startedReconnectRecently, updateLastEvent]);

  const handleSignal = useCallback(async (signal: VoiceSignal) => {
    await handleIncomingVoiceSignal({
      signal,
      role,
      peerRef,
      reconnectAllowedRef,
      pendingCandidatesRef,
      setStatus,
      setConnecting,
      updateLastEvent,
      postVoiceEvent,
      pauseDurationTracking,
      cleanup,
      onClose: onCloseRef.current,
      invokeCreatePeer,
      postSignal,
      flushPendingCandidates: async () => flushPendingCandidates(pendingCandidatesRef),
      handleVisitorRejoinRequest,
    });
  }, [
    cleanup,
    flushPendingCandidates,
    handleVisitorRejoinRequest,
    invokeCreatePeer,
    onCloseRef,
    pauseDurationTracking,
    peerRef,
    pendingCandidatesRef,
    postSignal,
    postVoiceEvent,
    reconnectAllowedRef,
    role,
    setConnecting,
    setStatus,
    updateLastEvent,
  ]);

  const pollSignals = useCallback(async () => {
    await pollVoiceSignals({
      token,
      role,
      lastSignalIdRef,
      handleSignal,
      setStatus,
      setConnecting,
      updateLastEvent,
      pauseDurationTracking,
      cleanup,
      onClose: onCloseRef.current,
    });
  }, [
    cleanup,
    handleSignal,
    lastSignalIdRef,
    onCloseRef,
    pauseDurationTracking,
    role,
    setConnecting,
    setStatus,
    token,
    updateLastEvent,
  ]);

  const attemptReconnect = useCallback(async () => {
    await attemptVoiceReconnect({
      role,
      closedRef,
      endingRef,
      reconnectingRef,
      reconnectAllowedRef,
      reconnectAttemptsRef,
      lastReconnectStartedAtRef,
      reconnectTimeoutRef,
      setStatus,
      setError,
      setIsReconnecting,
      setConnecting,
      updateLastEvent,
      postVoiceEvent,
      pauseDurationTracking,
      invokeCreatePeer,
      invokeSendOffer,
      postSignal,
      startedReconnectRecently,
      clearReconnectTimeout,
      retry: () => {
        void attemptReconnectRef.current?.();
      },
    });
  }, [
    attemptReconnectRef,
    clearReconnectTimeout,
    closedRef,
    endingRef,
    invokeCreatePeer,
    invokeSendOffer,
    lastReconnectStartedAtRef,
    pauseDurationTracking,
    postSignal,
    postVoiceEvent,
    reconnectAllowedRef,
    reconnectAttemptsRef,
    reconnectTimeoutRef,
    reconnectingRef,
    role,
    setConnecting,
    setError,
    setIsReconnecting,
    setStatus,
    startedReconnectRecently,
    updateLastEvent,
  ]);

  useEffect(() => {
    attemptReconnectRef.current = attemptReconnect;
  }, [attemptReconnect, attemptReconnectRef]);

  const shouldAttemptRecovery = useCallback(() => {
    return shouldAttemptVoiceRecovery(peerRef, callEstablishedRef, reconnectAllowedRef);
  }, [callEstablishedRef, peerRef, reconnectAllowedRef]);

  return {
    cleanup,
    handleVisitorRejoinRequest,
    handleSignal,
    pollSignals,
    attemptReconnect,
    shouldAttemptRecovery,
  };
}
