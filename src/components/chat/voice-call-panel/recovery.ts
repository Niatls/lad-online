type AttemptVoiceReconnectParams = {
  role: "admin" | "visitor";
  closedRef: { current: boolean };
  endingRef: { current: boolean };
  reconnectingRef: { current: boolean };
  reconnectAllowedRef: { current: boolean };
  reconnectAttemptsRef: { current: number };
  lastReconnectStartedAtRef: { current: number };
  reconnectTimeoutRef: { current: ReturnType<typeof setTimeout> | undefined };
  setStatus: (value: string) => void;
  setError: (value: string | null) => void;
  setIsReconnecting: (value: boolean) => void;
  setConnecting: (value: boolean) => void;
  updateLastEvent: (message: string, force?: boolean) => void;
  postVoiceEvent: (eventType: string, message: string, details?: unknown) => Promise<void>;
  pauseDurationTracking: () => void;
  invokeCreatePeer: () => Promise<RTCPeerConnection | null>;
  invokeSendOffer: (iceRestart?: boolean) => Promise<void>;
  postSignal: (signalType: string, payload: unknown) => Promise<void>;
  startedReconnectRecently: (now?: number) => boolean;
  clearReconnectTimeout: () => void;
  retry: () => void;
};

type HandleVoiceForegroundRecoveryParams = {
  closedRef: { current: boolean };
  endingRef: { current: boolean };
  localStreamRef: { current: MediaStream | null };
  reconnectAllowedRef: { current: boolean };
  updateLastEvent: (message: string, force?: boolean) => void;
  postVoiceEvent: (eventType: string, message: string, details?: unknown) => Promise<void>;
  setStatus: (value: string) => void;
  pauseDurationTracking: () => void;
  requestWakeLock: () => Promise<void>;
  startKeepAliveAudio: () => Promise<void>;
  syncMediaSession: (state: "none" | "active") => void;
  restoreAudioAfterInterruption: (reason: string) => Promise<void>;
  shouldAttemptRecovery: () => boolean;
  attemptReconnect: () => Promise<void>;
};

export async function attemptVoiceReconnect({
  role,
  closedRef,
  endingRef,
  reconnectingRef,
  reconnectAllowedRef,
  reconnectAttemptsRef,
  lastReconnectStartedAtRef,
  reconnectTimeoutRef,
  setStatus,
  setError,
  setIsReconnecting,
  setConnecting,
  updateLastEvent,
  postVoiceEvent,
  pauseDurationTracking,
  invokeCreatePeer,
  invokeSendOffer,
  postSignal,
  startedReconnectRecently,
  clearReconnectTimeout,
  retry,
}: AttemptVoiceReconnectParams) {
  const now = Date.now();
  if (closedRef.current || endingRef.current || reconnectingRef.current || startedReconnectRecently(now)) {
    return;
  }

  if (!reconnectAllowedRef.current) {
    return;
  }

  if (reconnectAttemptsRef.current >= 3) {
    setStatus("Не удалось восстановить звонок");
    updateLastEvent("Автовосстановление не удалось", true);
    void postVoiceEvent("reconnect-failed", "Автовосстановление не удалось", { attempts: reconnectAttemptsRef.current });
    setError("Соединение оборвалось и не восстановилось. Попробуйте начать звонок заново.");
    setIsReconnecting(false);
    setConnecting(false);
    return;
  }

  reconnectingRef.current = true;
  lastReconnectStartedAtRef.current = now;
  reconnectAttemptsRef.current += 1;
  pauseDurationTracking();
  setError(null);
  setIsReconnecting(true);
  setConnecting(true);
  setStatus(`Восстанавливаем соединение (${reconnectAttemptsRef.current}/3)...`);
  updateLastEvent(`Обрыв связи: попытка восстановления ${reconnectAttemptsRef.current}/3`, true);
  void postVoiceEvent("reconnect-attempt", "Попытка восстановления соединения", {
    attempt: reconnectAttemptsRef.current,
  });

  try {
    if (role === "visitor") {
      await invokeCreatePeer();
      await invokeSendOffer(true);
    } else {
      await invokeCreatePeer();
      await postSignal("rejoin-request", { reconnect: true, attempt: reconnectAttemptsRef.current });
    }
  } catch (reconnectError) {
    console.error("Voice reconnect failed:", reconnectError);
    reconnectingRef.current = false;
    updateLastEvent("Попытка восстановления не удалась", true);
    clearReconnectTimeout();
    reconnectTimeoutRef.current = setTimeout(() => {
      void retry();
    }, 1500);
    return;
  }

  reconnectingRef.current = false;
}

export function shouldAttemptVoiceRecovery(
  peerRef: { current: RTCPeerConnection | null },
  callEstablishedRef: { current: boolean },
  reconnectAllowedRef: { current: boolean },
) {
  const pc = peerRef.current;
  if (!pc) {
    return Boolean(callEstablishedRef.current || reconnectAllowedRef.current);
  }

  return (
    ["failed", "disconnected", "closed"].includes(pc.connectionState) ||
    ["failed", "disconnected", "closed"].includes(pc.iceConnectionState)
  );
}

export function createVoiceForegroundRecoveryHandlers({
  closedRef,
  endingRef,
  localStreamRef,
  reconnectAllowedRef,
  updateLastEvent,
  postVoiceEvent,
  setStatus,
  pauseDurationTracking,
  requestWakeLock,
  startKeepAliveAudio,
  syncMediaSession,
  restoreAudioAfterInterruption,
  shouldAttemptRecovery,
  attemptReconnect,
}: HandleVoiceForegroundRecoveryParams) {
  const handleForegroundRecovery = () => {
    if (closedRef.current || endingRef.current) {
      return;
    }

    if (document.visibilityState === "visible") {
      void requestWakeLock();
      void startKeepAliveAudio();
      syncMediaSession("active");
      const audioTrack = localStreamRef.current?.getAudioTracks()[0];
      if (!audioTrack || audioTrack.readyState === "ended") {
        void restoreAudioAfterInterruption("foreground-return");
        return;
      }

      if (shouldAttemptRecovery()) {
        void attemptReconnect();
      }
    } else {
      void startKeepAliveAudio();
    }
  };

  const handleOnline = () => {
    updateLastEvent("Сеть снова доступна", true);
    void postVoiceEvent("network-online", "Сеть снова доступна");
    reconnectAllowedRef.current = true;
    handleForegroundRecovery();
  };

  const handleOffline = () => {
    setStatus("Соединение потеряно. Ждём сеть...");
    pauseDurationTracking();
    updateLastEvent("Соединение потеряно", true);
    void postVoiceEvent("network-offline", "Устройство потеряло сеть");
  };

  return { handleForegroundRecovery, handleOnline, handleOffline };
}
