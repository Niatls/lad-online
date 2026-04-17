type RestoreVoiceAudioParams = {
  reason: string;
  muted: boolean;
  role: "admin" | "visitor";
  localStreamRef: { current: MediaStream | null };
  peerRef: { current: RTCPeerConnection | null };
  closedRef: { current: boolean };
  endingRef: { current: boolean };
  restoringAudioRef: { current: boolean };
  reconnectAllowedRef: { current: boolean };
  setStatus: (value: string) => void;
  setError: (value: string | null) => void;
  updateLastEvent: (message: string, force?: boolean) => void;
  postVoiceEvent: (eventType: string, message: string, details?: unknown) => Promise<void>;
  acquireLocalAudioStream: () => Promise<MediaStream>;
  invokeSendOffer: (iceRestart?: boolean) => Promise<void>;
  postSignal: (signalType: string, payload: unknown) => Promise<void>;
};

type BindVoiceTrackLifecycleParams = {
  stream: MediaStream;
  updateLastEvent: (message: string, force?: boolean) => void;
  postVoiceEvent: (eventType: string, message: string, details?: unknown) => Promise<void>;
  restoreAudioAfterInterruption: (reason: string) => Promise<void>;
};

export async function restoreVoiceAudioAfterInterruption({
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
}: RestoreVoiceAudioParams) {
  if (closedRef.current || endingRef.current || restoringAudioRef.current) {
    return;
  }

  restoringAudioRef.current = true;
  setStatus("Восстанавливаем микрофон...");
  updateLastEvent(`Возвращаем аудио: ${reason}`, true);
  void postVoiceEvent("audio-restore", "Восстановление микрофона после прерывания", { reason });

  try {
    const nextStream = await acquireLocalAudioStream();
    const nextTrack = nextStream.getAudioTracks()[0];
    if (!nextTrack) {
      throw new Error("Не удалось получить аудиотрек после восстановления.");
    }

    if (muted) {
      nextTrack.enabled = false;
    }

    const previousStream = localStreamRef.current;
    localStreamRef.current = nextStream;

    const pc = peerRef.current;
    if (pc) {
      const sender = pc.getSenders().find((currentSender) => currentSender.track?.kind === "audio");
      if (sender) {
        await sender.replaceTrack(nextTrack);
      } else {
        pc.addTrack(nextTrack, nextStream);
      }
    }

    previousStream?.getTracks().forEach((track) => track.stop());
    reconnectAllowedRef.current = true;

    if (role === "visitor") {
      await invokeSendOffer(true);
    } else {
      await postSignal("rejoin-request", { reconnect: true, reason });
    }
  } catch (restoreError) {
    const message = restoreError instanceof Error ? restoreError.message : "Не удалось восстановить микрофон.";
    setError(message);
    updateLastEvent("Не удалось восстановить микрофон", true);
    void postVoiceEvent("audio-restore-failed", "Не удалось восстановить микрофон", {
      reason,
      error: message,
    });
  } finally {
    restoringAudioRef.current = false;
  }
}

export function bindVoiceLocalTrackLifecycle({
  stream,
  updateLastEvent,
  postVoiceEvent,
  restoreAudioAfterInterruption,
}: BindVoiceTrackLifecycleParams) {
  const audioTrack = stream.getAudioTracks()[0];
  if (!audioTrack) {
    return;
  }

  audioTrack.onended = () => {
    updateLastEvent("Локальный микрофон отключён устройством", true);
    void postVoiceEvent("local-track-ended", "Локальный аудиотрек завершился");
    if (document.visibilityState === "visible") {
      void restoreAudioAfterInterruption("track-ended");
    }
  };

  audioTrack.onmute = () => {
    void postVoiceEvent("local-track-muted", "Локальный аудиотрек временно замьючен");
  };

  audioTrack.onunmute = () => {
    void postVoiceEvent("local-track-unmuted", "Локальный аудиотрек снова активен");
  };
}
