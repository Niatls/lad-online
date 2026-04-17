"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  defaultIceServers,
  INITIAL_ICE_ROUTE,
  INITIAL_TRAFFIC_ROUTE_LABEL,
} from "./voice-call-panel/constants";
import { VoiceControlBar } from "./voice-call-panel/control-bar";
import { formatCallDuration, formatUsageBytes } from "./voice-call-panel/formatters";
import { VoiceInfoPanel } from "./voice-call-panel/info-panel";
import {
  bindVoiceLocalTrackLifecycle,
  restoreVoiceAudioAfterInterruption,
} from "./voice-call-panel/audio-lifecycle";
import {
  acquireVoiceAudioStream,
  releaseVoiceWakeLock,
  requestVoiceWakeLock,
  startVoiceKeepAliveAudio,
  stopVoiceKeepAliveAudio,
  syncVoiceMediaSession,
} from "./voice-call-panel/media";
import { createVoiceOfferSender, createVoicePeer } from "./voice-call-panel/peer";
import { pollVoiceSignals } from "./voice-call-panel/polling";
import {
  attemptVoiceReconnect,
  createVoiceForegroundRecoveryHandlers,
  shouldAttemptVoiceRecovery,
} from "./voice-call-panel/recovery";
import {
  handleIncomingVoiceSignal,
  handleVoiceVisitorRejoinRequest,
} from "./voice-call-panel/signal-handlers";
import { endVoiceInvite, postVoiceEventLog, postVoiceSignal } from "./voice-call-panel/signaling";
import {
  collectVoiceConnectionStats,
  collectVoicePeerDiagnostics,
  destroyVoicePeerConnection,
  resetVoiceConnectionStats,
} from "./voice-call-panel/stats";
import { startVoiceCall } from "./voice-call-panel/startup";
import type {
  VoiceCallPanelProps,
  VoicePeerDiagnostics,
  VoiceSignal,
  WakeLockSentinelLike,
} from "./voice-call-panel/types";

export function VoiceCallPanel({ token, role, title, onClose, onStatsChange }: VoiceCallPanelProps) {
  const [status, setStatus] = useState("Готовим аудио...");
  const [error, setError] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(true);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [muted, setMuted] = useState(false);
  const [durationSeconds, setDurationSeconds] = useState(0);
  const [usageBytes, setUsageBytes] = useState(0);
  const [iceRoute, setIceRoute] = useState(INITIAL_ICE_ROUTE);
  const [trafficRouteLabel, setTrafficRouteLabel] = useState(INITIAL_TRAFFIC_ROUTE_LABEL);
  const [lastEvent, setLastEvent] = useState("Инициализация звонка");
  const localStreamRef = useRef<MediaStream | null>(null);
  const peerRef = useRef<RTCPeerConnection | null>(null);
  const remoteAudioRef = useRef<HTMLAudioElement | null>(null);
  const lastSignalIdRef = useRef(0);
  const pollRef = useRef<ReturnType<typeof setInterval>>(undefined);
  const statsRef = useRef<ReturnType<typeof setInterval>>(undefined);
  const pendingCandidatesRef = useRef<RTCIceCandidateInit[]>([]);
  const joinedRef = useRef(false);
  const connectedAtRef = useRef<number | null>(null);
  const connectedSegmentStartedAtRef = useRef<number | null>(null);
  const accumulatedConnectedMsRef = useRef(0);
  const closedRef = useRef(false);
  const callEstablishedRef = useRef(false);
  const createPeerRef = useRef<(() => Promise<RTCPeerConnection | null>) | null>(null);
  const sendOfferRef = useRef<((iceRestart?: boolean) => Promise<void>) | null>(null);
  const attemptReconnectRef = useRef<(() => Promise<void>) | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const reconnectAttemptsRef = useRef(0);
  const reconnectingRef = useRef(false);
  const lastReconnectStartedAtRef = useRef(0);
  const endingRef = useRef(false);
  const pendingVisitorRejoinRef = useRef(false);
  const rejoinHandledAtRef = useRef(0);
  const startupJoinSentRef = useRef(false);
  const initialOfferSentRef = useRef(false);
  const reconnectAllowedRef = useRef(false);
  const lastEventAtRef = useRef(0);
  const lastEventValueRef = useRef("Инициализация звонка");
  const lastEventTimeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const onCloseRef = useRef(onClose);
  const wakeLockRef = useRef<WakeLockSentinelLike | null>(null);
  const restoringAudioRef = useRef(false);
  const keepAliveAudioRef = useRef<HTMLAudioElement | null>(null);
  const mountedRef = useRef(false);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  const counterpartLabel = useMemo(
    () => (role === "admin" ? "посетителя" : "специалиста"),
    [role],
  );

  useEffect(() => {
    const interval = setInterval(() => {
      const activeSegmentMs = connectedSegmentStartedAtRef.current
        ? Date.now() - connectedSegmentStartedAtRef.current
        : 0;
      setDurationSeconds(Math.max(0, Math.floor((accumulatedConnectedMsRef.current + activeSegmentMs) / 1000)));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    startupJoinSentRef.current = false;
    initialOfferSentRef.current = false;
    reconnectAllowedRef.current = false;
  }, [role, token]);

  const acquireLocalAudioStream = useCallback(async () => acquireVoiceAudioStream(), []);

  const stopKeepAliveAudio = useCallback(() => {
    stopVoiceKeepAliveAudio(keepAliveAudioRef);
  }, []);

  const startKeepAliveAudio = useCallback(async () => {
    await startVoiceKeepAliveAudio(keepAliveAudioRef);
  }, []);

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
    [role, startKeepAliveAudio, title],
  );

  const releaseWakeLock = useCallback(async () => {
    await releaseVoiceWakeLock(wakeLockRef);
  }, []);

  const requestWakeLock = useCallback(async () => {
    await requestVoiceWakeLock(wakeLockRef);
  }, []);

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

  const updateLastEvent = useCallback((message: string, force = false) => {
    if (lastEventValueRef.current === message) {
      return;
    }

    const now = Date.now();
    const elapsed = now - lastEventAtRef.current;

    if (!force && elapsed < 900) {
      if (lastEventTimeoutRef.current) {
        clearTimeout(lastEventTimeoutRef.current);
      }

      lastEventTimeoutRef.current = setTimeout(() => {
        lastEventValueRef.current = message;
        lastEventAtRef.current = Date.now();
        setLastEvent(message);
      }, 900 - elapsed);
      return;
    }

    if (lastEventTimeoutRef.current) {
      clearTimeout(lastEventTimeoutRef.current);
      lastEventTimeoutRef.current = undefined;
    }

    lastEventValueRef.current = message;
    lastEventAtRef.current = now;
    setLastEvent(message);
  }, []);

  const getCurrentDurationSeconds = useCallback(() => {
    const activeSegmentMs = connectedSegmentStartedAtRef.current
      ? Date.now() - connectedSegmentStartedAtRef.current
      : 0;
    return Math.max(0, Math.floor((accumulatedConnectedMsRef.current + activeSegmentMs) / 1000));
  }, []);

  const pauseDurationTracking = useCallback(() => {
    if (!connectedSegmentStartedAtRef.current) {
      return;
    }

    accumulatedConnectedMsRef.current += Date.now() - connectedSegmentStartedAtRef.current;
    connectedSegmentStartedAtRef.current = null;
    setDurationSeconds(Math.max(0, Math.floor(accumulatedConnectedMsRef.current / 1000)));
  }, []);

  const resumeDurationTracking = useCallback(() => {
    if (connectedSegmentStartedAtRef.current) {
      return;
    }

    const now = Date.now();
    connectedSegmentStartedAtRef.current = now;
    if (!connectedAtRef.current) {
      connectedAtRef.current = now;
    }
    setDurationSeconds(getCurrentDurationSeconds());
  }, [getCurrentDurationSeconds]);

  const resetDurationTracking = useCallback(() => {
    connectedAtRef.current = null;
    connectedSegmentStartedAtRef.current = null;
    accumulatedConnectedMsRef.current = 0;
    setDurationSeconds(0);
  }, []);

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
  }, []);

  const invokeCreatePeer = useCallback(async () => {
    const createPeer = createPeerRef.current;
    if (typeof createPeer !== "function") {
      throw new Error("Voice createPeer handler is unavailable");
    }

    return createPeer();
  }, []);

  const invokeSendOffer = useCallback(async (iceRestart = false) => {
    const sendOffer = sendOfferRef.current;
    if (typeof sendOffer !== "function") {
      throw new Error("Voice sendOffer handler is unavailable");
    }

    return sendOffer(iceRestart);
  }, []);

  const destroyPeerConnection = useCallback(() => {
    destroyVoicePeerConnection(peerRef);
  }, []);

  const clearReconnectTimeout = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = undefined;
    }
  }, []);

  const startedReconnectRecently = useCallback((now = Date.now()) => {
    return now - lastReconnectStartedAtRef.current < 2000;
  }, []);

  const collectPeerDiagnostics = useCallback(async (pc: RTCPeerConnection | null): Promise<VoicePeerDiagnostics> => {
    return collectVoicePeerDiagnostics(pc, iceRoute, trafficRouteLabel, reconnectingRef.current);
  }, [iceRoute, trafficRouteLabel]);

  const markCallActive = useCallback(() => {
    if (callEstablishedRef.current) {
      resumeDurationTracking();
      return;
    }

    callEstablishedRef.current = true;
    reconnectAttemptsRef.current = 0;
    lastReconnectStartedAtRef.current = 0;
    reconnectAllowedRef.current = true;
    reconnectingRef.current = false;
    clearReconnectTimeout();
    setIsReconnecting(false);
    resumeDurationTracking();
    setStatus("Звонок активен");
    void startKeepAliveAudio();
    syncMediaSession("active");
    updateLastEvent("Аудиоканал подключён", true);
    void postVoiceEvent("call-active", "Аудиоканал подключён");
    setConnecting(false);

    if (!statsRef.current) {
      void refreshConnectionStats();
      statsRef.current = setInterval(() => {
        void refreshConnectionStats();
      }, 1000);
    }
  }, [clearReconnectTimeout, postVoiceEvent, refreshConnectionStats, resumeDurationTracking, startKeepAliveAudio, syncMediaSession, updateLastEvent]);

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
    [acquireLocalAudioStream, invokeSendOffer, muted, postSignal, postVoiceEvent, role, updateLastEvent],
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

  const endInviteRemotely = useCallback(async () => {
    if (endingRef.current) {
      return;
    }

    endingRef.current = true;
    await endVoiceInvite({
      token,
      role,
      usageBytes,
      durationSeconds: getCurrentDurationSeconds(),
      postSignal,
    });
  }, [getCurrentDurationSeconds, postSignal, role, token, usageBytes]);

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
    clearReconnectTimeout,
    invokeCreatePeer,
    invokeSendOffer,
    pauseDurationTracking,
    postSignal,
    postVoiceEvent,
    role,
    startedReconnectRecently,
    updateLastEvent,
  ]);

  useEffect(() => {
    attemptReconnectRef.current = attemptReconnect;
  }, [attemptReconnect]);

  const shouldAttemptRecovery = useCallback(() => {
    return shouldAttemptVoiceRecovery(peerRef, callEstablishedRef, reconnectAllowedRef);
  }, []);

  const flushPendingCandidates = useCallback(async () => {
    const pc = peerRef.current;
    if (!pc?.remoteDescription || pendingCandidatesRef.current.length === 0) {
      return;
    }

    const candidates = [...pendingCandidatesRef.current];
    pendingCandidatesRef.current = [];

    for (const candidate of candidates) {
      try {
        await pc.addIceCandidate(candidate);
      } catch (candidateError) {
        console.error("Failed to add buffered ICE candidate:", candidateError);
      }
    }
  }, []);

  const cleanup = useCallback(
    () => {
      if (closedRef.current) {
        return;
      }

      closedRef.current = true;
      clearReconnectTimeout();
      if (lastEventTimeoutRef.current) {
        clearTimeout(lastEventTimeoutRef.current);
        lastEventTimeoutRef.current = undefined;
      }

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
      destroyPeerConnection();
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
    },
    [clearReconnectTimeout, destroyPeerConnection, releaseWakeLock, resetDurationTracking, stopKeepAliveAudio, syncMediaSession],
  );

  const handleVisitorRejoinRequest = useCallback(async () => {
    await handleVoiceVisitorRejoinRequest({
      rejoinHandledAtRef,
      lastReconnectStartedAtRef,
      pendingVisitorRejoinRef,
      createPeerRef,
      sendOfferRef,
      startedReconnectRecently,
      setStatus,
      updateLastEvent,
      invokeCreatePeer,
      invokeSendOffer,
    });
  }, [invokeCreatePeer, invokeSendOffer, startedReconnectRecently, updateLastEvent]);

  const handleSignal = useCallback(
    async (signal: VoiceSignal) => {
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
        flushPendingCandidates,
        handleVisitorRejoinRequest,
      });
    },
    [cleanup, flushPendingCandidates, handleVisitorRejoinRequest, invokeCreatePeer, pauseDurationTracking, postSignal, postVoiceEvent, role, updateLastEvent],
  );

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
  }, [cleanup, handleSignal, pauseDurationTracking, role, token, updateLastEvent]);

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
  }, [attemptReconnect, pauseDurationTracking, postVoiceEvent, requestWakeLock, restoreAudioAfterInterruption, shouldAttemptRecovery, startKeepAliveAudio, syncMediaSession, token, updateLastEvent]);

  useEffect(() => {
    mountedRef.current = true;

    createPeerRef.current = async () => {
      const currentStream = localStreamRef.current;
      if (!currentStream) {
        return null;
      }

      return createVoicePeer({
        currentStream,
        reconnecting: reconnectingRef.current,
        token,
        defaultIceServers,
        peerRef,
        remoteAudioRef,
        closedRef,
        endingRef,
        callEstablishedRef,
        pendingCandidatesRef,
        setStatus,
        setError,
        setIsReconnecting,
        setConnecting,
        updateLastEvent,
        resetDurationTracking,
        destroyPeerConnection,
        markCallActive,
        pauseDurationTracking,
        resumeDurationTracking,
        attemptReconnect,
        collectPeerDiagnostics,
        postVoiceEvent,
        postSignal,
        resetConnectionStats: () => {
          resetVoiceConnectionStats(setUsageBytes, setIceRoute, setTrafficRouteLabel);
        },
      });
    };

    sendOfferRef.current = createVoiceOfferSender({
      peerRef,
      createPeer: async () => createPeerRef.current?.() ?? null,
      postSignal,
      setStatus,
      updateLastEvent,
      postVoiceEvent,
    });

    void startVoiceCall({
      mountedRef,
      token,
      role,
      counterpartLabel,
      startupJoinSentRef,
      initialOfferSentRef,
      joinedRef,
      closedRef,
      endingRef,
      reconnectingRef,
      reconnectAttemptsRef,
      pendingVisitorRejoinRef,
      rejoinHandledAtRef,
      reconnectAllowedRef,
      lastSignalIdRef,
      pollRef,
      setStatus,
      setError,
      setConnecting,
      updateLastEvent,
      postVoiceEvent,
      requestWakeLock,
      startKeepAliveAudio,
      syncMediaSession,
      acquireLocalAudioStream: async () => {
        const stream = await acquireLocalAudioStream();
        localStreamRef.current = stream;
        return stream;
      },
      bindLocalTrackLifecycle,
      createPeer: async () => invokeCreatePeer(),
      sendOffer: async (iceRestart = false) => invokeSendOffer(iceRestart),
      handleVisitorRejoinRequest,
      pollSignals,
    });

    return () => {
      mountedRef.current = false;
      createPeerRef.current = null;
      sendOfferRef.current = null;
      cleanup();
    };
  }, [acquireLocalAudioStream, attemptReconnect, bindLocalTrackLifecycle, cleanup, counterpartLabel, destroyPeerConnection, handleVisitorRejoinRequest, invokeCreatePeer, invokeSendOffer, markCallActive, pauseDurationTracking, pollSignals, postSignal, postVoiceEvent, requestWakeLock, resetDurationTracking, resumeDurationTracking, role, startKeepAliveAudio, syncMediaSession, token, updateLastEvent]);

  useEffect(() => {
    if (!onStatsChange) {
      return;
    }

    const isRelay = trafficRouteLabel.toLowerCase().includes("relay");
    onStatsChange({
      durationSeconds,
      usageBytes,
      liveServerBytes: isRelay ? usageBytes * 2 : 0,
      trafficRouteLabel,
      iceRoute,
      connected: callEstablishedRef.current && !connecting,
    });
  }, [connecting, durationSeconds, iceRoute, onStatsChange, trafficRouteLabel, usageBytes]);

  useEffect(() => {
    return () => {
      if (onStatsChange) {
        onStatsChange(null);
      }
    };
  }, [onStatsChange]);

  const toggleMute = () => {
    const track = localStreamRef.current?.getAudioTracks()[0];
    if (!track) {
      return;
    }

    track.enabled = !track.enabled;
    setMuted(!track.enabled);
  };

  const handleEnd = async () => {
    updateLastEvent("Вы завершили звонок", true);
    void postVoiceEvent("local-hangup", "Пользователь завершил звонок");
    await endInviteRemotely();
    cleanup();
    onCloseRef.current();
  };

  return (
    <div className="absolute inset-0 z-20 bg-white/95 backdrop-blur-xl p-6 flex flex-col">
      <audio ref={remoteAudioRef} autoPlay playsInline />
      <VoiceInfoPanel
        connecting={connecting}
        durationLabel={formatCallDuration(durationSeconds)}
        error={error}
        iceRoute={iceRoute}
        isReconnecting={isReconnecting}
        lastEvent={lastEvent}
        role={role}
        status={status}
        title={title}
        trafficRouteLabel={trafficRouteLabel}
        usageBytes={usageBytes}
        usageLabel={formatUsageBytes(usageBytes)}
      />

      <VoiceControlBar
        muted={muted}
        onEnd={() => {
          void handleEnd();
        }}
        onToggleMute={toggleMute}
      />
    </div>
  );
}
