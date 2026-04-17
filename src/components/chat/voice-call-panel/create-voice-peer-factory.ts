import { defaultIceServers } from "./constants";
import { createVoicePeer } from "./peer";
import { resetVoiceConnectionStats } from "./stats";
import type { VoicePeerDiagnostics } from "./types";

type CreateVoicePeerFactoryParams = {
  attemptReconnect: () => Promise<void>;
  callEstablishedRef: React.MutableRefObject<boolean>;
  closedRef: React.MutableRefObject<boolean>;
  collectPeerDiagnostics: (pc: RTCPeerConnection | null) => Promise<VoicePeerDiagnostics>;
  createPeerRef: React.MutableRefObject<(() => Promise<RTCPeerConnection | null>) | null>;
  currentStreamRef: React.MutableRefObject<MediaStream | null>;
  destroyPeerConnection: () => void;
  endingRef: React.MutableRefObject<boolean>;
  markCallActive: () => void;
  pauseDurationTracking: () => void;
  peerRef: React.MutableRefObject<RTCPeerConnection | null>;
  pendingCandidatesRef: React.MutableRefObject<RTCIceCandidateInit[]>;
  postSignal: (signalType: string, payload: unknown) => Promise<void>;
  postVoiceEvent: (eventType: string, message: string, details?: unknown) => Promise<void>;
  reconnectingRef: React.MutableRefObject<boolean>;
  remoteAudioRef: React.MutableRefObject<HTMLAudioElement | null>;
  resetDurationTracking: () => void;
  resumeDurationTracking: () => void;
  setConnecting: React.Dispatch<React.SetStateAction<boolean>>;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
  setIceRoute: React.Dispatch<React.SetStateAction<string>>;
  setIsReconnecting: React.Dispatch<React.SetStateAction<boolean>>;
  setStatus: React.Dispatch<React.SetStateAction<string>>;
  setTrafficRouteLabel: React.Dispatch<React.SetStateAction<string>>;
  setUsageBytes: React.Dispatch<React.SetStateAction<number>>;
  token: string;
  updateLastEvent: (message: string, force?: boolean) => void;
};

export function createVoicePeerFactory({
  attemptReconnect,
  callEstablishedRef,
  closedRef,
  collectPeerDiagnostics,
  createPeerRef,
  currentStreamRef,
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
}: CreateVoicePeerFactoryParams) {
  createPeerRef.current = async () => {
    const currentStream = currentStreamRef.current;
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
}
