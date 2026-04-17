import type { VoicePeerDiagnostics } from "./types";

type AttachVoicePeerEventsParams = {
  attemptReconnect: () => Promise<void>;
  callEstablishedRef: { current: boolean };
  closedRef: { current: boolean };
  collectPeerDiagnostics: (pc: RTCPeerConnection | null) => Promise<VoicePeerDiagnostics>;
  endingRef: { current: boolean };
  markCallActive: () => void;
  pauseDurationTracking: () => void;
  pc: RTCPeerConnection;
  peerRef: { current: RTCPeerConnection | null };
  postSignal: (signalType: string, payload: unknown) => Promise<void>;
  postVoiceEvent: (eventType: string, message: string, details?: unknown) => Promise<void>;
  remoteAudioRef: { current: HTMLAudioElement | null };
  resumeDurationTracking: () => void;
  setStatus: (value: string) => void;
  updateLastEvent: (message: string, force?: boolean) => void;
};

export function attachVoicePeerEvents({
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
}: AttachVoicePeerEventsParams) {
  pc.onicecandidate = (event) => {
    if (peerRef.current !== pc || closedRef.current) {
      return;
    }

    if (event.candidate) {
      void postSignal("candidate", event.candidate.toJSON());
    }
  };

  pc.ontrack = (event) => {
    if (peerRef.current !== pc || closedRef.current) {
      return;
    }

    const [remoteStream] = event.streams;
    if (remoteAudioRef.current && remoteStream) {
      remoteAudioRef.current.srcObject = remoteStream;
      void remoteAudioRef.current.play().catch(() => undefined);
    }
    markCallActive();
  };

  pc.onconnectionstatechange = () => {
    if (peerRef.current !== pc || closedRef.current) {
      return;
    }

    if (pc.connectionState === "connected") {
      setStatus("РђСѓРґРёРѕРєР°РЅР°Р» РіРѕС‚РѕРІ. РџРѕРґРєР»СЋС‡Р°РµРј СЃРѕР±РµСЃРµРґРЅРёРєР°...");
      if (callEstablishedRef.current) {
        resumeDurationTracking();
      }
      updateLastEvent("WebRTC connectionState: connected");
      void postVoiceEvent("connection-state", "WebRTC connectionState: connected");
    } else if (pc.connectionState === "connecting") {
      setStatus("РЎРѕРµРґРёРЅСЏРµРј Р°СѓРґРёРѕРєР°РЅР°Р»...");
      updateLastEvent("WebRTC connectionState: connecting");
    } else if (pc.connectionState === "failed") {
      pauseDurationTracking();
      updateLastEvent("WebRTC connectionState: failed", true);
      void collectPeerDiagnostics(pc).then((details) => {
        void postVoiceEvent("connection-state", "WebRTC connectionState: failed", details);
      });
      void attemptReconnect();
    } else if (["disconnected", "closed"].includes(pc.connectionState)) {
      pauseDurationTracking();
      updateLastEvent(`WebRTC connectionState: ${pc.connectionState}`, true);
      void collectPeerDiagnostics(pc).then((details) => {
        void postVoiceEvent("connection-state", `WebRTC connectionState: ${pc.connectionState}`, details);
      });
      if (!closedRef.current && !endingRef.current) {
        void attemptReconnect();
      }
    }
  };

  pc.oniceconnectionstatechange = () => {
    if (peerRef.current !== pc || closedRef.current) {
      return;
    }

    if (pc.iceConnectionState === "checking") {
      if (callEstablishedRef.current) {
        pauseDurationTracking();
      }
      setStatus("РџСЂРѕРІРµСЂСЏРµРј РјР°СЂС€СЂСѓС‚ РґР»СЏ Р·РІРѕРЅРєР°...");
      updateLastEvent("ICE: checking");
    } else if (pc.iceConnectionState === "connected" || pc.iceConnectionState === "completed") {
      setStatus("РњР°СЂС€СЂСѓС‚ РЅР°Р№РґРµРЅ. Р–РґС‘Рј Р°СѓРґРёРѕ...");
      if (callEstablishedRef.current) {
        resumeDurationTracking();
      }
      updateLastEvent(`ICE: ${pc.iceConnectionState}`);
    } else if (pc.iceConnectionState === "failed") {
      pauseDurationTracking();
      updateLastEvent("ICE: failed", true);
      void collectPeerDiagnostics(pc).then((details) => {
        void postVoiceEvent("ice-state", "ICE: failed", details);
      });
      void attemptReconnect();
    }
  };

  pc.onicegatheringstatechange = () => {
    if (peerRef.current !== pc || closedRef.current) {
      return;
    }

    if (pc.iceGatheringState === "complete") {
      void collectPeerDiagnostics(pc).then((details) => {
        void postVoiceEvent("ice-gathering-state", "ICE gathering complete", details);
      });
    }
  };
}
