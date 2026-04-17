"use client";

import { useCallback } from "react";

import { collectVoicePeerDiagnostics, destroyVoicePeerConnection } from "./stats";
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
  const invokeCreatePeer = useCallback(async () => {
    const createPeer = createPeerRef.current;
    if (typeof createPeer !== "function") {
      throw new Error("Voice createPeer handler is unavailable");
    }

    return createPeer();
  }, [createPeerRef]);

  const invokeSendOffer = useCallback(async (iceRestart = false) => {
    const sendOffer = sendOfferRef.current;
    if (typeof sendOffer !== "function") {
      throw new Error("Voice sendOffer handler is unavailable");
    }

    return sendOffer(iceRestart);
  }, [sendOfferRef]);

  const destroyPeerConnection = useCallback(() => {
    destroyVoicePeerConnection(peerRef);
  }, [peerRef]);

  const startedReconnectRecently = useCallback((now = Date.now()) => {
    return now - lastReconnectStartedAtRef.current < 2000;
  }, [lastReconnectStartedAtRef]);

  const collectPeerDiagnostics = useCallback(async (pc: RTCPeerConnection | null): Promise<VoicePeerDiagnostics> => {
    return collectVoicePeerDiagnostics(pc, iceRoute, trafficRouteLabel, reconnectingRef.current);
  }, [iceRoute, reconnectingRef, trafficRouteLabel]);

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
    setStatus("\u0417\u0432\u043e\u043d\u043e\u043a \u0430\u043a\u0442\u0438\u0432\u0435\u043d");
    void startKeepAliveAudio();
    syncMediaSession("active");
    updateLastEvent("\u0410\u0443\u0434\u0438\u043e\u043a\u0430\u043d\u0430\u043b \u043f\u043e\u0434\u043a\u043b\u044e\u0447\u0451\u043d", true);
    void postVoiceEvent("call-active", "\u0410\u0443\u0434\u0438\u043e\u043a\u0430\u043d\u0430\u043b \u043f\u043e\u0434\u043a\u043b\u044e\u0447\u0451\u043d");
    setConnecting(false);

    if (!statsRef.current) {
      void refreshConnectionStats();
      statsRef.current = setInterval(() => {
        void refreshConnectionStats();
      }, 1000);
    }
  }, [
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
  ]);

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
