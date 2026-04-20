import type { VoiceSignal } from "./types";

type HandleVisitorRejoinRequestParams = {
  rejoinHandledAtRef: { current: number };
  lastReconnectStartedAtRef: { current: number };
  pendingVisitorRejoinRef: { current: boolean };
  createPeerRef: { current: (() => Promise<RTCPeerConnection | null>) | null };
  sendOfferRef: { current: ((iceRestart?: boolean) => Promise<void>) | null };
  startedReconnectRecently: (now?: number) => boolean;
  setStatus: (value: string) => void;
  updateLastEvent: (message: string, force?: boolean) => void;
  invokeCreatePeer: () => Promise<RTCPeerConnection | null>;
  invokeSendOffer: (iceRestart?: boolean) => Promise<void>;
};

type HandleVoiceSignalParams = {
  signal: VoiceSignal;
  role: "admin" | "visitor";
  peerRef: { current: RTCPeerConnection | null };
  reconnectAllowedRef: { current: boolean };
  pendingCandidatesRef: { current: RTCIceCandidateInit[] };
  setStatus: (value: string) => void;
  setConnecting: (value: boolean) => void;
  updateLastEvent: (message: string, force?: boolean) => void;
  postVoiceEvent: (eventType: string, message: string, details?: unknown) => Promise<void>;
  pauseDurationTracking: () => void;
  cleanup: () => void;
  onClose: () => void;
  invokeCreatePeer: () => Promise<RTCPeerConnection | null>;
  postSignal: (signalType: string, payload: unknown) => Promise<void>;
  flushPendingCandidates: () => Promise<void>;
  handleVisitorRejoinRequest: () => Promise<void>;
};

export async function handleVoiceVisitorRejoinRequest({
  rejoinHandledAtRef,
  lastReconnectStartedAtRef,
  pendingVisitorRejoinRef,
  createPeerRef,
  sendOfferRef,
  startedReconnectRecently,
  setStatus,
  updateLastEvent,
  invokeCreatePeer,
  invokeSendOffer,
}: HandleVisitorRejoinRequestParams) {
  const now = Date.now();
  if (now - rejoinHandledAtRef.current < 1800 || startedReconnectRecently(now)) {
    return;
  }

  const hasCreatePeer = typeof createPeerRef.current === "function";
  const hasSendOffer = typeof sendOfferRef.current === "function";

  if (!hasCreatePeer || !hasSendOffer) {
    pendingVisitorRejoinRef.current = true;
    return;
  }

  pendingVisitorRejoinRef.current = false;
  rejoinHandledAtRef.current = now;
  lastReconnectStartedAtRef.current = now;
  setStatus("Переподключаем звонок...");
  updateLastEvent("Получен запрос на переподключение", true);
  await invokeCreatePeer();
  await invokeSendOffer(true);
}

export async function handleIncomingVoiceSignal({
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
  onClose,
  invokeCreatePeer,
  postSignal,
  flushPendingCandidates,
  handleVisitorRejoinRequest,
}: HandleVoiceSignalParams) {
  if (signal.signalType === "offer" && role === "visitor") {
    let pc = peerRef.current;
    const needsFreshPeer =
      !pc ||
      ["closed", "failed", "disconnected"].includes(pc.connectionState) ||
      pc.signalingState !== "stable";

    if (needsFreshPeer) {
      pc = await invokeCreatePeer();
    }

    if (!pc) {
      return;
    }

    setStatus("Входящий звонок. Подключаем аудио...");
    updateLastEvent("Получен offer от специалиста", true);
    await pc.setRemoteDescription(signal.payload as RTCSessionDescriptionInit);
    reconnectAllowedRef.current = true;
    await flushPendingCandidates();
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    await postSignal("answer", answer);
    setStatus("Соединяемся...");
    return;
  }

  if (signal.signalType === "answer" && role === "admin") {
    const pc = peerRef.current;
    if (!pc || pc.signalingState !== "have-local-offer") {
      return;
    }

    await pc.setRemoteDescription(signal.payload as RTCSessionDescriptionInit);
    reconnectAllowedRef.current = true;
    updateLastEvent("Получен answer от посетителя", true);
    await flushPendingCandidates();
    setStatus("Соединяемся...");
    return;
  }

  if (signal.signalType === "candidate") {
    const pc = peerRef.current;
    if (!pc) {
      return;
    }

    const candidate = signal.payload as RTCIceCandidateInit;
    if (pc.remoteDescription) {
      await pc.addIceCandidate(candidate);
    } else {
      pendingCandidatesRef.current.push(candidate);
    }
    return;
  }

  if (signal.signalType === "rejoin-request" && role === "admin") {
    await handleVisitorRejoinRequest();
    return;
  }


  if (signal.signalType === "hangup") {
    setStatus("Звонок завершён");
    updateLastEvent("Собеседник завершил звонок", true);
    void postVoiceEvent("remote-hangup", "Собеседник завершил звонок");
    setConnecting(false);
    pauseDurationTracking();
    cleanup();
    onClose();
  }
}
