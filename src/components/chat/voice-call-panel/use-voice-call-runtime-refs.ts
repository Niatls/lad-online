"use client";

import { useEffect, useRef } from "react";

import type { WakeLockSentinelLike } from "./types";

export function useVoiceCallRuntimeRefs(onClose: () => void) {
  const localStreamRef = useRef<MediaStream | null>(null);
  const peerRef = useRef<RTCPeerConnection | null>(null);
  const remoteAudioRef = useRef<HTMLAudioElement | null>(null);
  const lastSignalIdRef = useRef(0);
  const pollRef = useRef<ReturnType<typeof setInterval>>(undefined);
  const statsRef = useRef<ReturnType<typeof setInterval>>(undefined);
  const pendingCandidatesRef = useRef<RTCIceCandidateInit[]>([]);
  const joinedRef = useRef(false);
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
  const onCloseRef = useRef(onClose);
  const wakeLockRef = useRef<WakeLockSentinelLike | null>(null);
  const restoringAudioRef = useRef(false);
  const keepAliveAudioRef = useRef<HTMLAudioElement | null>(null);
  const mountedRef = useRef(false);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  return {
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
  };
}
