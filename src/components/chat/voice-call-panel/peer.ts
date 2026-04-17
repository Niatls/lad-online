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

  const iceConfigRes = await fetch("/api/chat/voice/ice-servers", { cache: "no-store" }).catch(() => null);
  const iceConfigJson = iceConfigRes && iceConfigRes.ok ? await iceConfigRes.json() : null;
  const iceServers = Array.isArray(iceConfigJson?.iceServers) && iceConfigJson.iceServers.length > 0
    ? iceConfigJson.iceServers
    : defaultIceServers;
  const relayIceServers = iceServers.filter((server) => {
    const urls = Array.isArray(server.urls) ? server.urls : [server.urls];
    return urls.some((url) => typeof url === "string" && /^turns?:/i.test(url));
  });
  const relayOnly = reconnecting && relayIceServers.length > 0;

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
    relayOnly ? "Создан peer с relay-only реконнектом" : "Создан peer со стандартным ICE маршрутом",
    {
      relayOnly,
      totalIceServers: iceServers.length,
      relayIceServers: relayIceServers.length,
      token,
    },
  );

  currentStream.getTracks().forEach((track) => pc.addTrack(track, currentStream));

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
      setStatus("Аудиоканал готов. Подключаем собеседника...");
      if (callEstablishedRef.current) {
        resumeDurationTracking();
      }
      updateLastEvent("WebRTC connectionState: connected");
      void postVoiceEvent("connection-state", "WebRTC connectionState: connected");
    } else if (pc.connectionState === "connecting") {
      setStatus("Соединяем аудиоканал...");
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
      setStatus("Проверяем маршрут для звонка...");
      updateLastEvent("ICE: checking");
    } else if (pc.iceConnectionState === "connected" || pc.iceConnectionState === "completed") {
      setStatus("Маршрут найден. Ждём аудио...");
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
    const pc = peerRef.current ?? await createPeer();
    if (!pc || pc.signalingState !== "stable") {
      return;
    }

    const offer = await pc.createOffer({ offerToReceiveAudio: true, iceRestart });
    await pc.setLocalDescription(offer);
    await postSignal("offer", offer);
    setStatus(iceRestart ? "Переподключаем специалиста..." : "Вызываем специалиста...");
    updateLastEvent(iceRestart ? "Отправлен offer с ICE restart" : "Отправлен новый offer", true);
    void postVoiceEvent(
      iceRestart ? "offer-restart" : "offer-created",
      iceRestart ? "Отправлен offer с ICE restart" : "Отправлен новый offer",
    );
  };
}
