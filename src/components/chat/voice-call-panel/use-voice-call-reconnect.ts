"use client";

import { useCallback, useEffect } from "react";

import { attemptVoiceReconnect, shouldAttemptVoiceRecovery } from "./recovery";

type UseVoiceCallReconnectParams = {
  attemptReconnectRef: React.MutableRefObject<(() => Promise<void>) | null>;
  callEstablishedRef: React.MutableRefObject<boolean>;
  clearReconnectTimeout: () => void;
  closedRef: React.MutableRefObject<boolean>;
  endingRef: React.MutableRefObject<boolean>;
  invokeCreatePeer: () => Promise<RTCPeerConnection | null>;
  invokeSendOffer: (iceRestart?: boolean) => Promise<void>;
  lastReconnectStartedAtRef: React.MutableRefObject<number>;
  pauseDurationTracking: () => void;
  peerRef: React.MutableRefObject<RTCPeerConnection | null>;
  postSignal: (signalType: string, payload: unknown) => Promise<void>;
  postVoiceEvent: (eventType: string, message: string, details?: unknown) => Promise<void>;
  reconnectAllowedRef: React.MutableRefObject<boolean>;
  reconnectAttemptsRef: React.MutableRefObject<number>;
  reconnectTimeoutRef: React.MutableRefObject<ReturnType<typeof setTimeout> | undefined>;
  reconnectingRef: React.MutableRefObject<boolean>;
  role: "admin" | "visitor";
  setConnecting: React.Dispatch<React.SetStateAction<boolean>>;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
  setIsReconnecting: React.Dispatch<React.SetStateAction<boolean>>;
  setStatus: React.Dispatch<React.SetStateAction<string>>;
  startedReconnectRecently: (now?: number) => boolean;
  updateLastEvent: (message: string, force?: boolean) => void;
};

export function useVoiceCallReconnect({
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
}: UseVoiceCallReconnectParams) {
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
    attemptReconnect,
    shouldAttemptRecovery,
  };
}
