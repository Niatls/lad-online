"use client";

import { useCallback } from "react";

import { pollVoiceSignals } from "./polling";
import {
  handleIncomingVoiceSignal,
  handleVoiceVisitorRejoinRequest,
} from "./signal-handlers";
import type { VoiceSignal } from "./types";

type UseVoiceCallSignalPollingParams = {
  cleanup: () => void;
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
  lastSignalIdRef: React.MutableRefObject<number>;
  onCloseRef: React.MutableRefObject<() => void>;
  pauseDurationTracking: () => void;
  pendingCandidatesRef: React.MutableRefObject<RTCIceCandidateInit[]>;
  peerRef: React.MutableRefObject<RTCPeerConnection | null>;
  pollRole: "admin" | "visitor";
  pollToken: string;
  postSignal: (signalType: string, payload: unknown) => Promise<void>;
  postVoiceEvent: (eventType: string, message: string, details?: unknown) => Promise<void>;
  reconnectAllowedRef: React.MutableRefObject<boolean>;
  role: "admin" | "visitor";
  setConnecting: React.Dispatch<React.SetStateAction<boolean>>;
  setStatus: React.Dispatch<React.SetStateAction<string>>;
  startedReconnectRecently: (now?: number) => boolean;
  updateLastEvent: (message: string, force?: boolean) => void;
};

export function useVoiceCallSignalPolling({
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
  pollRole,
  pollToken,
  postSignal,
  postVoiceEvent,
  reconnectAllowedRef,
  role,
  setConnecting,
  setStatus,
  startedReconnectRecently,
  updateLastEvent,
}: UseVoiceCallSignalPollingParams) {
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
      token: pollToken,
      role: pollRole,
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
    pollRole,
    pollToken,
    setConnecting,
    setStatus,
    updateLastEvent,
  ]);

  return {
    handleVisitorRejoinRequest,
    handleSignal,
    pollSignals,
  };
}
