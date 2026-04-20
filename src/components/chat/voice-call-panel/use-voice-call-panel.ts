"use client";

import { formatCallDuration, formatUsageBytes } from "./formatters";
import { useVoiceCallActions } from "./use-voice-call-actions";
import { useVoiceCallAudioRecovery } from "./use-voice-call-audio-recovery";
import { useVoiceCallClearTimeout } from "./use-voice-call-clear-timeout";
import { useVoiceCallConnection } from "./use-voice-call-connection";
import { useVoiceCallCounterpartLabel } from "./use-voice-call-counterpart-label";
import { useVoiceCallDuration } from "./use-voice-call-duration";
import { useVoiceCallLocalAudioStream } from "./use-voice-call-local-audio-stream";
import { useVoiceCallMediaControls } from "./use-voice-call-media-controls";
import { useVoiceCallRecoveryHandlers } from "./use-voice-call-recovery-handlers";
import { useVoiceCallRuntimeRefs } from "./use-voice-call-runtime-refs";
import { useVoiceCallSignalController } from "./use-voice-call-signal-controller";
import { useVoiceCallSessionReset } from "./use-voice-call-session-reset";
import { useVoiceCallStartup } from "./use-voice-call-startup";
import { useVoiceCallState } from "./use-voice-call-state";
import { useVoiceCallStatsChange } from "./use-voice-call-stats-change";
import { useVoiceCallTrackLifecycle } from "./use-voice-call-track-lifecycle";
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

  const counterpartLabel = useVoiceCallCounterpartLabel(role);

  useVoiceCallSessionReset({
    initialOfferSentRef,
    reconnectAllowedRef,
    role,
    startupJoinSentRef,
    token,
  });

  const acquireLocalAudioStream = useVoiceCallLocalAudioStream();

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

  const clearReconnectTimeout = useVoiceCallClearTimeout(reconnectTimeoutRef);

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

  const restoreAudioAfterInterruption = useVoiceCallAudioRecovery({
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
  });

  const bindLocalTrackLifecycle = useVoiceCallTrackLifecycle({
    postVoiceEvent,
    restoreAudioAfterInterruption,
    updateLastEvent,
  });

  const handleVisitorRejoinRequestDeps = useMemo(
    () => ({
      rejoinHandledAtRef,
      lastReconnectStartedAtRef,
      pendingVisitorRejoinRef,
      createPeerRef,
      sendOfferRef,
    }),
    [createPeerRef, lastReconnectStartedAtRef, pendingVisitorRejoinRef, rejoinHandledAtRef, sendOfferRef],
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
