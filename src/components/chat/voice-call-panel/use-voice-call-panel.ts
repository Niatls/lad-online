"use client";

import { useCallback, useMemo } from "react";

import {
  bindVoiceLocalTrackLifecycle,
  restoreVoiceAudioAfterInterruption,
} from "./audio-lifecycle";
import { formatCallDuration, formatUsageBytes } from "./formatters";
import { acquireVoiceAudioStream } from "./media";
import { useVoiceCallActions } from "./use-voice-call-actions";
import { useVoiceCallConnection } from "./use-voice-call-connection";
import { useVoiceCallDuration } from "./use-voice-call-duration";
import { useVoiceCallMediaControls } from "./use-voice-call-media-controls";
import { useVoiceCallRecoveryHandlers } from "./use-voice-call-recovery-handlers";
import { useVoiceCallRuntimeRefs } from "./use-voice-call-runtime-refs";
import { useVoiceCallSignalController } from "./use-voice-call-signal-controller";
import { useVoiceCallSessionReset } from "./use-voice-call-session-reset";
import { useVoiceCallStartup } from "./use-voice-call-startup";
import { useVoiceCallState } from "./use-voice-call-state";
import { useVoiceCallStatsChange } from "./use-voice-call-stats-change";
import { useVoiceLastEvent } from "./use-voice-last-event";
import type { VoiceCallPanelProps } from "./types";

export function useVoiceCallPanel({
  token,
  role,
  title,
  onClose,
  onStatsChange,
}: VoiceCallPanelProps) {
  const {
    status,
    setStatus,
    error,
    setError,
    connecting,
    setConnecting,
    isReconnecting,
    setIsReconnecting,
    muted,
    setMuted,
    usageBytes,
    setUsageBytes,
    iceRoute,
    setIceRoute,
    trafficRouteLabel,
    setTrafficRouteLabel,
  } = useVoiceCallState();

  const {
    durationSeconds,
    getCurrentDurationSeconds,
    pauseDurationTracking,
    resumeDurationTracking,
    resetDurationTracking,
  } = useVoiceCallDuration();

  const { lastEvent, updateLastEvent, clearPendingLastEvent } = useVoiceLastEvent();

  const {
    localStreamRef,
    peerRef,
    remoteAudioRef,
    lastSignalIdRef,
    pollRef,
    statsRef,
    pendingCandidatesRef,
    joinedRef,
    closedRef,
    callEstablishedRef,
    createPeerRef,
    sendOfferRef,
    attemptReconnectRef,
    reconnectTimeoutRef,
    reconnectAttemptsRef,
    reconnectingRef,
    lastReconnectStartedAtRef,
    endingRef,
    pendingVisitorRejoinRef,
    rejoinHandledAtRef,
    startupJoinSentRef,
    initialOfferSentRef,
    reconnectAllowedRef,
    onCloseRef,
    wakeLockRef,
    restoringAudioRef,
    keepAliveAudioRef,
    mountedRef,
  } = useVoiceCallRuntimeRefs(onClose);

  const counterpartLabel = useMemo(
    () => (role === "admin" ? "\u043f\u043e\u0441\u0435\u0442\u0438\u0442\u0435\u043b\u044f" : "\u0441\u043f\u0435\u0446\u0438\u0430\u043b\u0438\u0441\u0442\u0430"),
    [role],
  );

  useVoiceCallSessionReset({
    initialOfferSentRef,
    reconnectAllowedRef,
    role,
    startupJoinSentRef,
    token,
  });

  const acquireLocalAudioStream = useCallback(async () => acquireVoiceAudioStream(), []);

  const {
    stopKeepAliveAudio,
    startKeepAliveAudio,
    syncMediaSession,
    releaseWakeLock,
    requestWakeLock,
    postSignal,
    postVoiceEvent,
    refreshConnectionStats,
  } = useVoiceCallMediaControls({
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
  });

  const clearReconnectTimeout = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = undefined;
    }
  }, [reconnectTimeoutRef]);

  const {
    invokeCreatePeer,
    invokeSendOffer,
    destroyPeerConnection,
    startedReconnectRecently,
    collectPeerDiagnostics,
    markCallActive,
    flushPendingCandidates,
  } = useVoiceCallConnection({
    callEstablishedRef,
    clearReconnectTimeout,
    createPeerRef,
    lastReconnectStartedAtRef,
    peerRef,
    reconnectAllowedRef,
    reconnectAttemptsRef,
    reconnectTimeoutRef,
    reconnectingRef,
    refreshConnectionStats,
    resumeDurationTracking,
    sendOfferRef,
    setConnecting,
    setIsReconnecting,
    setStatus,
    startKeepAliveAudio,
    statsRef,
    syncMediaSession,
    trafficRouteLabel,
    updateLastEvent,
    iceRoute,
    postVoiceEvent,
  });

  const restoreAudioAfterInterruption = useCallback(
    async (reason: string) => {
      await restoreVoiceAudioAfterInterruption({
        reason,
        muted,
        role,
        localStreamRef,
        peerRef,
        closedRef,
        endingRef,
        restoringAudioRef,
        reconnectAllowedRef,
        setStatus,
        setError,
        updateLastEvent,
        postVoiceEvent,
        acquireLocalAudioStream,
        invokeSendOffer,
        postSignal,
      });
    },
    [
      acquireLocalAudioStream,
      closedRef,
      endingRef,
      invokeSendOffer,
      localStreamRef,
      muted,
      peerRef,
      postSignal,
      postVoiceEvent,
      reconnectAllowedRef,
      restoringAudioRef,
      role,
      setError,
      setStatus,
      updateLastEvent,
    ],
  );

  const bindLocalTrackLifecycle = useCallback(
    (stream: MediaStream) => {
      bindVoiceLocalTrackLifecycle({
        stream,
        updateLastEvent,
        postVoiceEvent,
        restoreAudioAfterInterruption,
      });
    },
    [postVoiceEvent, restoreAudioAfterInterruption, updateLastEvent],
  );

  const {
    cleanup,
    handleVisitorRejoinRequest,
    pollSignals,
    attemptReconnect,
    shouldAttemptRecovery,
  } = useVoiceCallSignalController({
    attemptReconnectRef,
    callEstablishedRef,
    clearPendingLastEvent,
    clearReconnectTimeout,
    cleanupDestroyPeerConnection: destroyPeerConnection,
    closedRef,
    endingRef,
    flushPendingCandidates,
    handleVisitorRejoinRequestDeps: {
      rejoinHandledAtRef,
      lastReconnectStartedAtRef,
      pendingVisitorRejoinRef,
      createPeerRef,
      sendOfferRef,
    },
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
  });

  useVoiceCallRecoveryHandlers({
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
  });

  useVoiceCallStartup({
    acquireLocalAudioStream,
    attemptReconnect,
    bindLocalTrackLifecycle,
    callEstablishedRef,
    cleanup,
    closedRef,
    collectPeerDiagnostics,
    counterpartLabel,
    createPeerRef,
    destroyPeerConnection,
    endingRef,
    handleVisitorRejoinRequest,
    initialOfferSentRef,
    invokeCreatePeer,
    invokeSendOffer,
    joinedRef,
    lastSignalIdRef,
    localStreamRef,
    markCallActive,
    mountedRef,
    pauseDurationTracking,
    pendingCandidatesRef,
    pendingVisitorRejoinRef,
    peerRef,
    pollRef,
    pollSignals,
    postSignal,
    postVoiceEvent,
    reconnectAllowedRef,
    reconnectAttemptsRef,
    reconnectingRef,
    remoteAudioRef,
    requestWakeLock,
    resetDurationTracking,
    resumeDurationTracking,
    rejoinHandledAtRef,
    role,
    sendOfferRef,
    setConnecting,
    setError,
    setIceRoute,
    setIsReconnecting,
    setStatus,
    setTrafficRouteLabel,
    setUsageBytes,
    startKeepAliveAudio,
    startupJoinSentRef,
    syncMediaSession,
    token,
    updateLastEvent,
  });

  useVoiceCallStatsChange({
    callEstablishedRef,
    connecting,
    durationSeconds,
    iceRoute,
    onStatsChange,
    trafficRouteLabel,
    usageBytes,
  });

  const { toggleMute, handleEnd } = useVoiceCallActions({
    cleanup,
    endingRef,
    getCurrentDurationSeconds,
    localStreamRef,
    onCloseRef,
    postSignal,
    postVoiceEvent,
    role,
    setMuted,
    token,
    updateLastEvent,
    usageBytes,
  });

  return {
    remoteAudioRef,
    connecting,
    durationLabel: formatCallDuration(durationSeconds),
    error,
    handleEnd,
    iceRoute,
    isReconnecting,
    lastEvent,
    muted,
    status,
    toggleMute,
    trafficRouteLabel,
    usageBytes,
    usageLabel: formatUsageBytes(usageBytes),
  };
}
