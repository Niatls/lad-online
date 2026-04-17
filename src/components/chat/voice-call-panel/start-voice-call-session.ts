import { createVoiceOfferSender } from "./peer";
import { startVoiceCall } from "./startup";

type StartVoiceCallSessionParams = {
  acquireLocalAudioStream: () => Promise<MediaStream>;
  bindLocalTrackLifecycle: (stream: MediaStream) => void;
  closedRef: React.MutableRefObject<boolean>;
  counterpartLabel: string;
  createPeerRef: React.MutableRefObject<(() => Promise<RTCPeerConnection | null>) | null>;
  endingRef: React.MutableRefObject<boolean>;
  handleVisitorRejoinRequest: () => Promise<void>;
  initialOfferSentRef: React.MutableRefObject<boolean>;
  invokeCreatePeer: () => Promise<RTCPeerConnection | null>;
  invokeSendOffer: (iceRestart?: boolean) => Promise<void>;
  joinedRef: React.MutableRefObject<boolean>;
  lastSignalIdRef: React.MutableRefObject<number>;
  localStreamRef: React.MutableRefObject<MediaStream | null>;
  mountedRef: React.MutableRefObject<boolean>;
  pendingVisitorRejoinRef: React.MutableRefObject<boolean>;
  peerRef: React.MutableRefObject<RTCPeerConnection | null>;
  pollRef: React.MutableRefObject<ReturnType<typeof setInterval> | undefined>;
  pollSignals: () => Promise<void>;
  postSignal: (signalType: string, payload: unknown) => Promise<void>;
  postVoiceEvent: (eventType: string, message: string, details?: unknown) => Promise<void>;
  reconnectAllowedRef: React.MutableRefObject<boolean>;
  reconnectAttemptsRef: React.MutableRefObject<number>;
  reconnectingRef: React.MutableRefObject<boolean>;
  rejoinHandledAtRef: React.MutableRefObject<number>;
  role: "admin" | "visitor";
  sendOfferRef: React.MutableRefObject<((iceRestart?: boolean) => Promise<void>) | null>;
  setConnecting: React.Dispatch<React.SetStateAction<boolean>>;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
  setStatus: React.Dispatch<React.SetStateAction<string>>;
  startKeepAliveAudio: () => Promise<void>;
  startupJoinSentRef: React.MutableRefObject<boolean>;
  syncMediaSession: (state: "none" | "active") => void;
  token: string;
  updateLastEvent: (message: string, force?: boolean) => void;
  requestWakeLock: () => Promise<void>;
};

export function startVoiceCallSession({
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
  requestWakeLock,
}: StartVoiceCallSessionParams) {
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
}
