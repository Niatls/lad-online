"use client";

import { useCallback } from "react";

import { destroyVoicePeerConnection } from "./stats";

type UseVoiceCallInvokersParams = {
  createPeerRef: React.MutableRefObject<(() => Promise<RTCPeerConnection | null>) | null>;
  peerRef: React.MutableRefObject<RTCPeerConnection | null>;
  sendOfferRef: React.MutableRefObject<((iceRestart?: boolean) => Promise<void>) | null>;
};

export function useVoiceCallInvokers({
  createPeerRef,
  peerRef,
  sendOfferRef,
}: UseVoiceCallInvokersParams) {
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

  return {
    invokeCreatePeer,
    invokeSendOffer,
    destroyPeerConnection,
  };
}
