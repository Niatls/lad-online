type StartVoiceCallParams = {
  mountedRef: { current: boolean };
  token: string;
  role: "admin" | "visitor";
  counterpartLabel: string;
  startupJoinSentRef: { current: boolean };
  initialOfferSentRef: { current: boolean };
  joinedRef: { current: boolean };
  closedRef: { current: boolean };
  endingRef: { current: boolean };
  reconnectingRef: { current: boolean };
  reconnectAttemptsRef: { current: number };
  pendingVisitorRejoinRef: { current: boolean };
  rejoinHandledAtRef: { current: number };
  reconnectAllowedRef: { current: boolean };
  lastSignalIdRef: { current: number };
  pollRef: { current: ReturnType<typeof setInterval> | undefined };
  setStatus: (value: string) => void;
  setError: (value: string | null) => void;
  setConnecting: (value: boolean) => void;
  updateLastEvent: (message: string, force?: boolean) => void;
  postVoiceEvent: (eventType: string, message: string, details?: unknown) => Promise<void>;
  requestWakeLock: () => Promise<void>;
  startKeepAliveAudio: () => Promise<void>;
  syncMediaSession: (state: "none" | "active") => void;
  acquireLocalAudioStream: () => Promise<MediaStream>;
  bindLocalTrackLifecycle: (stream: MediaStream) => void;
  createPeer: () => Promise<RTCPeerConnection | null>;
  sendOffer: (iceRestart?: boolean) => Promise<void>;
  handleVisitorRejoinRequest: () => Promise<void>;
  pollSignals: () => Promise<void>;
};

export async function startVoiceCall({
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
  acquireLocalAudioStream,
  bindLocalTrackLifecycle,
  createPeer,
  sendOffer,
  handleVisitorRejoinRequest,
  pollSignals,
}: StartVoiceCallParams) {
  try {
    closedRef.current = false;
    endingRef.current = false;
    joinedRef.current = false;
    reconnectingRef.current = false;
    reconnectAttemptsRef.current = 0;
    pendingVisitorRejoinRef.current = false;
    rejoinHandledAtRef.current = 0;
    reconnectAllowedRef.current = false;
    lastSignalIdRef.current = 0;

    const inviteRes = await fetch(`/api/chat/voice/${token}`);
    if (!inviteRes.ok) {
      throw new Error("Приглашение на звонок больше недоступно.");
    }

    if (role === "visitor" && !startupJoinSentRef.current) {
      startupJoinSentRef.current = true;
      await fetch(`/api/chat/voice/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "join", role }),
      });
    }

    if (!mountedRef.current) {
      return;
    }

    const stream = await acquireLocalAudioStream();
    if (!mountedRef.current) {
      stream.getTracks().forEach((track) => track.stop());
      return;
    }

    bindLocalTrackLifecycle(stream);
    void requestWakeLock();
    void startKeepAliveAudio();
    syncMediaSession("active");
    setStatus(role === "visitor" ? "Готовим вызов специалиста..." : `Ждём звонок от ${counterpartLabel}...`);
    setError(null);
    setConnecting(true);

    await createPeer();

    if (role === "visitor" && pendingVisitorRejoinRef.current) {
      await handleVisitorRejoinRequest();
    }

    pollRef.current = setInterval(() => {
      void pollSignals();
    }, 1200);

    if (role === "visitor" && !joinedRef.current) {
      joinedRef.current = true;
      if (!initialOfferSentRef.current) {
        initialOfferSentRef.current = true;
        await sendOffer(false);
      }
    } else {
      setStatus(`Ждём звонок от ${counterpartLabel}...`);
      updateLastEvent(`Ожидаем ${counterpartLabel}`, true);
      joinedRef.current = true;
    }
  } catch (startError) {
    console.error("Voice call init failed:", startError);
    updateLastEvent("Ошибка инициализации voice", true);
    void postVoiceEvent("init-error", "Ошибка инициализации voice", {
      error: startError instanceof Error ? startError.message : String(startError),
    });
    setError(startError instanceof Error ? startError.message : "Не удалось запустить звонок.");
    setConnecting(false);
  }
}
