import { attachVoicePeerEvents } from "./attach-voice-peer-events";
import { resolveVoiceIceConfig } from "./resolve-voice-ice-config";
import type { IceServer, VoicePeerDiagnostics } from "./types";

type CreateVoicePeerParams = {
  currentStream: MediaStream;
  reconnecting: boolean;
  token: string;
  defaultIceServers: IceServer[];
  peerRef: { current: RTCPeerConnection | null };
  remoteAudioRef: { current: HTMLAudioElement | null };
  closedRef: { current: boolean };
  endingRef: { current: boolean };
  callEstablishedRef: { current: boolean };
  pendingCandidatesRef: { current: RTCIceCandidateInit[] };
  setStatus: (value: string) => void;
  setError: (value: string | null) => void;
  setIsReconnecting: (value: boolean) => void;
  setConnecting: (value: boolean) => void;
  updateLastEvent: (message: string, force?: boolean) => void;
  resetDurationTracking: () => void;
  destroyPeerConnection: () => void;
  markCallActive: () => void;
  pauseDurationTracking: () => void;
  resumeDurationTracking: () => void;
  attemptReconnect: () => Promise<void>;
  collectPeerDiagnostics: (pc: RTCPeerConnection | null) => Promise<VoicePeerDiagnostics>;
  postVoiceEvent: (eventType: string, message: string, details?: unknown) => Promise<void>;
  postSignal: (signalType: string, payload: unknown) => Promise<void>;
  resetConnectionStats: () => void;
};

type CreateVoiceOfferSenderParams = {
  peerRef: { current: RTCPeerConnection | null };
  createPeer: () => Promise<RTCPeerConnection | null>;
  postSignal: (signalType: string, payload: unknown) => Promise<void>;
  setStatus: (value: string) => void;
  updateLastEvent: (message: string, force?: boolean) => void;
  postVoiceEvent: (eventType: string, message: string, details?: unknown) => Promise<void>;
};

export async function createVoicePeer({
  currentStream,
  reconnecting,
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
  resetConnectionStats,
}: CreateVoicePeerParams) {
  destroyPeerConnection();
  pendingCandidatesRef.current = [];
  callEstablishedRef.current = false;
  resetDurationTracking();
  resetConnectionStats();
  setConnecting(true);
  setError(null);
  setIsReconnecting(reconnecting);

  const { iceServers, relayIceServers, relayOnly } = await resolveVoiceIceConfig({
    defaultIceServers,
    reconnecting,
  });

  const pc = new RTCPeerConnection(
    relayOnly
      ? {
          iceServers: relayIceServers,
          iceCandidatePoolSize: 0,
          iceTransportPolicy: "relay",
        }
      : {
          iceServers,
          iceCandidatePoolSize: 4,
        },
  );
  peerRef.current = pc;

  void postVoiceEvent(
    "peer-config",
    relayOnly ? "РЎРѕР·РґР°РЅ peer СЃ relay-only СЂРµРєРѕРЅРЅРµРєС‚РѕРј" : "РЎРѕР·РґР°РЅ peer СЃРѕ СЃС‚Р°РЅРґР°СЂС‚РЅС‹Рј ICE РјР°СЂС€СЂСѓС‚РѕРј",
    {
      relayOnly,
      totalIceServers: iceServers.length,
      relayIceServers: relayIceServers.length,
      token,
    },
  );

  currentStream.getTracks().forEach((track) => pc.addTrack(track, currentStream));

  attachVoicePeerEvents({
    attemptReconnect,
    callEstablishedRef,
    closedRef,
    collectPeerDiagnostics,
    endingRef,
    markCallActive,
    pauseDurationTracking,
    pc,
    peerRef,
    postSignal,
    postVoiceEvent,
    remoteAudioRef,
    resumeDurationTracking,
    setStatus,
    updateLastEvent,
  });

  return pc;
}

export function createVoiceOfferSender({
  peerRef,
  createPeer,
  postSignal,
  setStatus,
  updateLastEvent,
  postVoiceEvent,
}: CreateVoiceOfferSenderParams) {
  return async (iceRestart = false) => {
    const pc = peerRef.current ?? (await createPeer());
    if (!pc || pc.signalingState !== "stable") {
      return;
    }

    const offer = await pc.createOffer({ offerToReceiveAudio: true, iceRestart });
    await pc.setLocalDescription(offer);
    await postSignal("offer", offer);
    setStatus(iceRestart ? "РџРµСЂРµРїРѕРґРєР»СЋС‡Р°РµРј СЃРїРµС†РёР°Р»РёСЃС‚Р°..." : "Р’С‹Р·С‹РІР°РµРј СЃРїРµС†РёР°Р»РёСЃС‚Р°...");
    updateLastEvent(iceRestart ? "РћС‚РїСЂР°РІР»РµРЅ offer СЃ ICE restart" : "РћС‚РїСЂР°РІР»РµРЅ РЅРѕРІС‹Р№ offer", true);
    void postVoiceEvent(
      iceRestart ? "offer-restart" : "offer-created",
      iceRestart ? "РћС‚РїСЂР°РІР»РµРЅ offer СЃ ICE restart" : "РћС‚РїСЂР°РІР»РµРЅ РЅРѕРІС‹Р№ offer",
    );
  };
}
