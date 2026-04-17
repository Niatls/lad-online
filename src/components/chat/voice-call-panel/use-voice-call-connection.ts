"use client";

import { useCallback } from "react";

import { useVoiceCallActiveState } from "./use-voice-call-active-state";
import { useVoiceCallInvokers } from "./use-voice-call-invokers";
import { collectVoicePeerDiagnostics } from "./stats";
import type { VoicePeerDiagnostics } from "./types";

type UseVoiceCallConnectionParams = {
  callEstablishedRef: React.MutableRefObject<boolean>;
  clearReconnectTimeout: () => void;
  createPeerRef: React.MutableRefObject<(() => Promise<RTCPeerConnection | null>) | null>;
  lastReconnectStartedAtRef: React.MutableRefObject<number>;
  peerRef: React.MutableRefObject<RTCPeerConnection | null>;
  reconnectAllowedRef: React.MutableRefObject<boolean>;
  reconnectAttemptsRef: React.MutableRefObject<number>;
  reconnectTimeoutRef: React.MutableRefObject<ReturnType<typeof setTimeout> | undefined>;
  reconnectingRef: React.MutableRefObject<boolean>;
  refreshConnectionStats: () => Promise<void>;
  resumeDurationTracking: () => void;
  sendOfferRef: React.MutableRefObject<((iceRestart?: boolean) => Promise<void>) | null>;
  setConnecting: React.Dispatch<React.SetStateAction<boolean>>;
  setIsReconnecting: React.Dispatch<React.SetStateAction<boolean>>;
  setStatus: React.Dispatch<React.SetStateAction<string>>;
  startKeepAliveAudio: () => Promise<void>;
  statsRef: React.MutableRefObject<ReturnType<typeof setInterval> | undefined>;
  syncMediaSession: (state: "none" | "active") => void;
  trafficRouteLabel: string;
  updateLastEvent: (message: string, force?: boolean) => void;
  iceRoute: string;
  postVoiceEvent: (eventType: string, message: string, details?: unknown) => Promise<void>;
};

export function useVoiceCallConnection({
  callEstablishedRef,
  clearReconnectTimeout,
  createPeerRef,
  lastReconnectStartedAtRef,
  peerRef,
  reconnectAllowedRef,
  reconnectAttemptsRef,
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
}: UseVoiceCallConnectionParams) {
  const { invokeCreatePeer, invokeSendOffer, destroyPeerConnection } = useVoiceCallInvokers({
    createPeerRef,
    peerRef,
    sendOfferRef,
  });

  const startedReconnectRecently = useCallback((now = Date.now()) => {
    return now - lastReconnectStartedAtRef.current < 2000;
  }, [lastReconnectStartedAtRef]);

  const collectPeerDiagnostics = useCallback(async (pc: RTCPeerConnection | null): Promise<VoicePeerDiagnostics> => {
    return collectVoicePeerDiagnostics(pc, iceRoute, trafficRouteLabel, reconnectingRef.current);
  }, [iceRoute, reconnectingRef, trafficRouteLabel]);

  const markCallActive = useVoiceCallActiveState({
    callEstablishedRef,
    clearReconnectTimeout,
    lastReconnectStartedAtRef,
    postVoiceEvent,
    reconnectAllowedRef,
    reconnectAttemptsRef,
    reconnectingRef,
    refreshConnectionStats,
    resumeDurationTracking,
    setConnecting,
    setIsReconnecting,
    setStatus,
    startKeepAliveAudio,
    statsRef,
    syncMediaSession,
    updateLastEvent,
  });

  const flushPendingCandidates = useCallback(async (pendingCandidatesRef: React.MutableRefObject<RTCIceCandidateInit[]>) => {
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
  }, [peerRef]);

  return {
    invokeCreatePeer,
    invokeSendOffer,
    destroyPeerConnection,
    startedReconnectRecently,
    collectPeerDiagnostics,
    markCallActive,
    flushPendingCandidates,
  };
}
