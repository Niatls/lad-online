"use client";

import { useCallback } from "react";

import { restoreVoiceAudioAfterInterruption } from "./audio-lifecycle";

type UseVoiceCallAudioRecoveryParams = {
  acquireLocalAudioStream: () => Promise<MediaStream>;
  closedRef: React.MutableRefObject<boolean>;
  endingRef: React.MutableRefObject<boolean>;
  invokeSendOffer: (iceRestart?: boolean) => Promise<void>;
  localStreamRef: React.MutableRefObject<MediaStream | null>;
  muted: boolean;
  peerRef: React.MutableRefObject<RTCPeerConnection | null>;
  postSignal: (signalType: string, payload: unknown) => Promise<void>;
  postVoiceEvent: (eventType: string, message: string, details?: unknown) => Promise<void>;
  reconnectAllowedRef: React.MutableRefObject<boolean>;
  restoringAudioRef: React.MutableRefObject<boolean>;
  role: "admin" | "visitor";
  setError: React.Dispatch<React.SetStateAction<string | null>>;
  setStatus: React.Dispatch<React.SetStateAction<string>>;
  updateLastEvent: (message: string, force?: boolean) => void;
};

export function useVoiceCallAudioRecovery({
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
}: UseVoiceCallAudioRecoveryParams) {
  return useCallback(
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
}
