"use client";

import { useEffect } from "react";

import { defaultIceServers } from "./constants";
import { createVoiceOfferSender, createVoicePeer } from "./peer";
import { startVoiceCall } from "./startup";
import { resetVoiceConnectionStats } from "./stats";
import type { VoicePeerDiagnostics } from "./types";

type UseVoiceCallStartupParams = {
  acquireLocalAudioStream: () => Promise<MediaStream>;
  attemptReconnect: () => Promise<void>;
  bindLocalTrackLifecycle: (stream: MediaStream) => void;
  callEstablishedRef: React.MutableRefObject<boolean>;
  cleanup: () => void;
  closedRef: React.MutableRefObject<boolean>;
  collectPeerDiagnostics: (pc: RTCPeerConnection | null) => Promise<VoicePeerDiagnostics>;
  counterpartLabel: string;
  createPeerRef: React.MutableRefObject<(() => Promise<RTCPeerConnection | null>) | null>;
  destroyPeerConnection: () => void;
  endingRef: React.MutableRefObject<boolean>;
  handleVisitorRejoinRequest: () => Promise<void>;
  initialOfferSentRef: React.MutableRefObject<boolean>;
  invokeCreatePeer: () => Promise<RTCPeerConnection | null>;
  invokeSendOffer: (iceRestart?: boolean) => Promise<void>;
  joinedRef: React.MutableRefObject<boolean>;
  lastSignalIdRef: React.MutableRefObject<number>;
  localStreamRef: React.MutableRefObject<MediaStream | null>;
  markCallActive: () => void;
  mountedRef: React.MutableRefObject<boolean>;
  pauseDurationTracking: () => void;
  pendingCandidatesRef: React.MutableRefObject<RTCIceCandidateInit[]>;
  pendingVisitorRejoinRef: React.MutableRefObject<boolean>;
  peerRef: React.MutableRefObject<RTCPeerConnection | null>;
  pollRef: React.MutableRefObject<ReturnType<typeof setInterval> | undefined>;
  pollSignals: () => Promise<void>;
  postSignal: (signalType: string, payload: unknown) => Promise<void>;
  postVoiceEvent: (eventType: string, message: string, details?: unknown) => Promise<void>;
  reconnectAllowedRef: React.MutableRefObject<boolean>;
  reconnectAttemptsRef: React.MutableRefObject<number>;
  reconnectingRef: React.MutableRefObject<boolean>;
  remoteAudioRef: React.MutableRefObject<HTMLAudioElement | null>;
  requestWakeLock: () => Promise<void>;
  resetDurationTracking: () => void;
  resumeDurationTracking: () => void;
  rejoinHandledAtRef: React.MutableRefObject<number>;
  role: "admin" | "visitor";
  sendOfferRef: React.MutableRefObject<((iceRestart?: boolean) => Promise<void>) | null>;
  setConnecting: React.Dispatch<React.SetStateAction<boolean>>;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
  setIceRoute: React.Dispatch<React.SetStateAction<string>>;
  setIsReconnecting: React.Dispatch<React.SetStateAction<boolean>>;
  setStatus: React.Dispatch<React.SetStateAction<string>>;
  setTrafficRouteLabel: React.Dispatch<React.SetStateAction<string>>;
  setUsageBytes: React.Dispatch<React.SetStateAction<number>>;
  startKeepAliveAudio: () => Promise<void>;
  startupJoinSentRef: React.MutableRefObject<boolean>;
  syncMediaSession: (state: "none" | "active") => void;
  token: string;
  updateLastEvent: (message: string, force?: boolean) => void;
};

export function useVoiceCallStartup({
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
}: UseVoiceCallStartupParams) {
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
  }, [
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
  ]);
}
