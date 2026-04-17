"use client";

import { useVoiceCallCleanup } from "./use-voice-call-cleanup";
import { useVoiceCallReconnect } from "./use-voice-call-reconnect";
import { useVoiceCallSignalPolling } from "./use-voice-call-signal-polling";

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
  const cleanup = useVoiceCallCleanup({
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
  });

  const { handleVisitorRejoinRequest, handleSignal, pollSignals } = useVoiceCallSignalPolling({
    cleanup,
    flushPendingCandidates,
    handleVisitorRejoinRequestDeps,
    invokeCreatePeer,
    invokeSendOffer,
    lastSignalIdRef,
    onCloseRef,
    pauseDurationTracking,
    pendingCandidatesRef,
    peerRef,
    pollRole: role,
    pollToken: token,
    postSignal,
    postVoiceEvent,
    reconnectAllowedRef,
    role,
    setConnecting,
    setStatus,
    startedReconnectRecently,
    updateLastEvent,
  });

  const { attemptReconnect, shouldAttemptRecovery } = useVoiceCallReconnect({
    attemptReconnectRef,
    callEstablishedRef,
    clearReconnectTimeout,
    closedRef,
    endingRef,
    invokeCreatePeer,
    invokeSendOffer,
    lastReconnectStartedAtRef,
    pauseDurationTracking,
    peerRef,
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
  });

  return {
    cleanup,
    handleVisitorRejoinRequest,
    handleSignal,
    pollSignals,
    attemptReconnect,
    shouldAttemptRecovery,
  };
}
