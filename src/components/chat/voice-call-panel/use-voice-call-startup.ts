"use client";

import { useEffect } from "react";

import { createVoicePeerFactory } from "./create-voice-peer-factory";
import { startVoiceCallSession } from "./start-voice-call-session";
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

    createVoicePeerFactory({
      attemptReconnect,
      callEstablishedRef,
      closedRef,
      collectPeerDiagnostics,
      createPeerRef,
      currentStreamRef: localStreamRef,
      destroyPeerConnection,
      endingRef,
      markCallActive,
      pauseDurationTracking,
      peerRef,
      pendingCandidatesRef,
      postSignal,
      postVoiceEvent,
      reconnectingRef,
      remoteAudioRef,
      resetDurationTracking,
      resumeDurationTracking,
      setConnecting,
      setError,
      setIceRoute,
      setIsReconnecting,
      setStatus,
      setTrafficRouteLabel,
      setUsageBytes,
      token,
      updateLastEvent,
    });

    startVoiceCallSession({
      acquireLocalAudioStream,
      bindLocalTrackLifecycle,
      closedRef,
      counterpartLabel,
      createPeerRef,
      endingRef,
      handleVisitorRejoinRequest,
      initialOfferSentRef,
      invokeCreatePeer,
      invokeSendOffer,
      joinedRef,
      lastSignalIdRef,
      localStreamRef,
      mountedRef,
      pendingVisitorRejoinRef,
      peerRef,
      pollRef,
      pollSignals,
      postSignal,
      postVoiceEvent,
      reconnectAllowedRef,
      reconnectAttemptsRef,
      reconnectingRef,
      rejoinHandledAtRef,
      requestWakeLock,
      role,
      sendOfferRef,
      setConnecting,
      setError,
      setStatus,
      startKeepAliveAudio,
      startupJoinSentRef,
      syncMediaSession,
      token,
      updateLastEvent,
    });

    return () => {
      mountedRef.current = false;
      createPeerRef.current = null;
      sendOfferRef.current = null;
      cleanup();
    };
  }, [
    token,
    role,
  ]);
}

