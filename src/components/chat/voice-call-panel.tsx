"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Loader2, Mic, MicOff, Phone, PhoneOff, Radio } from "lucide-react";

type VoiceCallPanelProps = {
  token: string;
  role: "admin" | "visitor";
  title: string;
  onClose: () => void;
  onStatsChange?: (stats: {
    durationSeconds: number;
    usageBytes: number;
    liveServerBytes: number;
    trafficRouteLabel: string;
    iceRoute: string;
    connected: boolean;
  } | null) => void;
};

type VoiceSignal = {
  id: number;
  senderRole: string;
  signalType: string;
  payload: unknown;
  createdAt: string;
};

type IceServer = {
  urls: string | string[];
  username?: string;
  credential?: string;
};

type WakeLockSentinelLike = {
  released: boolean;
  release: () => Promise<void>;
};

const defaultIceServers: IceServer[] = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun1.l.google.com:19302" },
];

const MONTHLY_CAP_BYTES = 1000 * 1024 * 1024 * 1024;
const SILENT_KEEPALIVE_AUDIO =
  "data:audio/mp3;base64,SUQzAwAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4LjMyLjEwMQAAAAAAAAAAAAAA//uQxAADBzQABpAAAANIAAAAAExBTUUzLjk4LjIAAAAAAAAAAAAAAP/7kMQAAgc0AAaQAAACQAAAABBMQU1FMy45OC4yAAAAAAAAAAAAAAD/+5DEAAIHNAAGkAAAAkAAAAAQTEFNRTMuOTguMgAAAAAAAAAAAAAA//uQxAADBzQABpAAAANIAAAAAExBTUUzLjk4LjIAAAAAAAAAAAAAAP/7kMQAAgc0AAaQAAACQAAAABBMQU1FMy45OC4yAAAAAAAAAAAAAAD/+5DEAAIHNAAGkAAAAkAAAAAQTEFNRTMuOTguMgAAAAAAAAAAAAAA";

export function VoiceCallPanel({ token, role, title, onClose, onStatsChange }: VoiceCallPanelProps) {
  const [status, setStatus] = useState("Готовим аудио...");
  const [error, setError] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(true);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [muted, setMuted] = useState(false);
  const [durationSeconds, setDurationSeconds] = useState(0);
  const [usageBytes, setUsageBytes] = useState(0);
  const [iceRoute, setIceRoute] = useState("Ищем маршрут...");
  const [trafficRouteLabel, setTrafficRouteLabel] = useState("Определяем маршрут трафика...");
  const [lastEvent, setLastEvent] = useState("Инициализация звонка");
  const localStreamRef = useRef<MediaStream | null>(null);
  const peerRef = useRef<RTCPeerConnection | null>(null);
  const remoteAudioRef = useRef<HTMLAudioElement | null>(null);
  const lastSignalIdRef = useRef(0);
  const pollRef = useRef<ReturnType<typeof setInterval>>(undefined);
  const statsRef = useRef<ReturnType<typeof setInterval>>(undefined);
  const pendingCandidatesRef = useRef<RTCIceCandidateInit[]>([]);
  const joinedRef = useRef(false);
  const connectedAtRef = useRef<number | null>(null);
  const connectedSegmentStartedAtRef = useRef<number | null>(null);
  const accumulatedConnectedMsRef = useRef(0);
  const closedRef = useRef(false);
  const callEstablishedRef = useRef(false);
  const createPeerRef = useRef<(() => Promise<RTCPeerConnection | null>) | null>(null);
  const sendOfferRef = useRef<((iceRestart?: boolean) => Promise<void>) | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const reconnectAttemptsRef = useRef(0);
  const reconnectingRef = useRef(false);
  const endingRef = useRef(false);
  const pendingVisitorRejoinRef = useRef(false);
  const rejoinHandledAtRef = useRef(0);
  const startupJoinSentRef = useRef(false);
  const initialOfferSentRef = useRef(false);
  const reconnectAllowedRef = useRef(false);
  const lastEventAtRef = useRef(0);
  const lastEventValueRef = useRef("Инициализация звонка");
  const lastEventTimeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const onCloseRef = useRef(onClose);
  const wakeLockRef = useRef<WakeLockSentinelLike | null>(null);
  const restoringAudioRef = useRef(false);
  const keepAliveAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  const counterpartLabel = useMemo(
    () => (role === "admin" ? "посетителя" : "специалиста"),
    [role],
  );

  const formatDuration = useCallback((value: number) => {
    const hours = Math.floor(value / 3600);
    const minutes = Math.floor((value % 3600) / 60);
    const seconds = value % 60;

    if (hours > 0) {
      return [hours, minutes, seconds].map((part) => String(part).padStart(2, "0")).join(":");
    }

    return [minutes, seconds].map((part) => String(part).padStart(2, "0")).join(":");
  }, []);

  const formatUsage = useCallback((value: number) => {
    if (value < 1024 * 1024) {
      return `${(value / 1024).toFixed(1)} KB`;
    }

    if (value < 1024 * 1024 * 1024) {
      return `${(value / (1024 * 1024)).toFixed(2)} MB`;
    }

    return `${(value / (1024 * 1024 * 1024)).toFixed(3)} GB`;
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const activeSegmentMs = connectedSegmentStartedAtRef.current
        ? Date.now() - connectedSegmentStartedAtRef.current
        : 0;
      setDurationSeconds(Math.max(0, Math.floor((accumulatedConnectedMsRef.current + activeSegmentMs) / 1000)));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    startupJoinSentRef.current = false;
    initialOfferSentRef.current = false;
    reconnectAllowedRef.current = false;
  }, [role, token]);

  const wait = useCallback((ms: number) => {
    return new Promise<void>((resolve) => {
      setTimeout(resolve, ms);
    });
  }, []);

  const normalizeMediaError = useCallback((error: unknown) => {
    if (!(error instanceof Error)) {
      return "Не удалось получить доступ к микрофону.";
    }

    const mediaError = error as Error & { name?: string };
    const name = mediaError.name ?? "";
    const message = mediaError.message || "";
    const lowerMessage = message.toLowerCase();

    if (name === "NotAllowedError" || lowerMessage.includes("permission")) {
      return "Нет доступа к микрофону. Разрешите микрофон для сайта в браузере.";
    }

    if (name === "NotFoundError" || name === "DevicesNotFoundError") {
      return "Микрофон не найден на устройстве.";
    }

    if (
      name === "NotReadableError" ||
      name === "TrackStartError" ||
      lowerMessage.includes("could not start audio source")
    ) {
      return "Не удалось запустить микрофон. Закройте приложения, которые могут использовать микрофон, и повторите.";
    }

    if (name === "AbortError") {
      return "Не удалось инициализировать микрофон. Попробуйте ещё раз.";
    }

    return message || "Не удалось получить доступ к микрофону.";
  }, []);

  const acquireLocalAudioStream = useCallback(async () => {
    const variants: MediaStreamConstraints[] = [
      {
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      },
      {
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      },
      { audio: true },
    ];

    let lastError: unknown = null;

    for (const constraints of variants) {
      for (let attempt = 0; attempt < 3; attempt += 1) {
        try {
          return await navigator.mediaDevices.getUserMedia(constraints);
        } catch (error) {
          lastError = error;
          const mediaError = error as Error & { name?: string };
          const name = mediaError.name ?? "";
          const message = mediaError.message?.toLowerCase() ?? "";
          const micBusyError =
            name === "NotReadableError" ||
            name === "TrackStartError" ||
            message.includes("could not start audio source");

          if (!micBusyError) {
            break;
          }

          await wait(350 + attempt * 350);
        }
      }
    }

    throw new Error(normalizeMediaError(lastError));
  }, [normalizeMediaError, wait]);

  const stopKeepAliveAudio = useCallback(() => {
    const audio = keepAliveAudioRef.current;
    if (!audio) {
      return;
    }

    audio.pause();
    audio.src = "";
    keepAliveAudioRef.current = null;
  }, []);

  const startKeepAliveAudio = useCallback(async () => {
    if (typeof window === "undefined") {
      return;
    }

    let audio = keepAliveAudioRef.current;
    if (!audio) {
      audio = new Audio(SILENT_KEEPALIVE_AUDIO);
      audio.loop = true;
      audio.playsInline = true;
      audio.preload = "auto";
      audio.volume = 0.001;
      keepAliveAudioRef.current = audio;
    }

    try {
      await audio.play();
    } catch {
      // keep-alive audio is best effort only
    }
  }, []);

  const syncMediaSession = useCallback(
    (state: "none" | "active") => {
      const mediaSession = (navigator as Navigator & {
        mediaSession?: {
          metadata: MediaMetadata | null;
          playbackState: "none" | "paused" | "playing";
          setActionHandler: (action: string, handler: (() => void) | null) => void;
        };
      }).mediaSession;

      if (!mediaSession) {
        return;
      }

      if (state === "none") {
        mediaSession.playbackState = "none";
        mediaSession.metadata = null;
        mediaSession.setActionHandler("play", null);
        mediaSession.setActionHandler("pause", null);
        mediaSession.setActionHandler("stop", null);
        return;
      }

      try {
        mediaSession.metadata = new MediaMetadata({
          title,
          artist: role === "admin" ? "Посетитель" : "Поддержка Лад",
          album: "Voice Mode",
        });
      } catch {
        // ignore metadata failures on unsupported browsers
      }

      mediaSession.playbackState = "playing";
      mediaSession.setActionHandler("play", () => {
        void startKeepAliveAudio();
      });
      mediaSession.setActionHandler("pause", () => {
        void onCloseRef.current();
      });
      mediaSession.setActionHandler("stop", () => {
        void onCloseRef.current();
      });
    },
    [role, startKeepAliveAudio, title],
  );

  const releaseWakeLock = useCallback(async () => {
    const sentinel = wakeLockRef.current;
    wakeLockRef.current = null;

    if (!sentinel || sentinel.released) {
      return;
    }

    try {
      await sentinel.release();
    } catch {
      // ignore wake lock release failures
    }
  }, []);

  const requestWakeLock = useCallback(async () => {
    if (typeof navigator === "undefined" || document.visibilityState !== "visible") {
      return;
    }

    const wakeLockApi = (navigator as Navigator & {
      wakeLock?: {
        request: (type: "screen") => Promise<WakeLockSentinelLike>;
      };
    }).wakeLock;

    if (!wakeLockApi) {
      return;
    }

    if (wakeLockRef.current && !wakeLockRef.current.released) {
      return;
    }

    try {
      wakeLockRef.current = await wakeLockApi.request("screen");
    } catch {
      // wake lock is best effort only
    }
  }, []);

  const postSignal = useCallback(
    async (signalType: string, payload: unknown) => {
      await fetch(`/api/chat/voice/${token}/signals`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, signalType, payload }),
      });
    },
    [role, token],
  );

  const postVoiceEvent = useCallback(
    async (eventType: string, message: string, details?: unknown) => {
      try {
        await fetch(`/api/chat/voice/${token}/events`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ role, eventType, message, details }),
        });
      } catch {
        // best effort logging only
      }
    },
    [role, token],
  );

  const updateLastEvent = useCallback((message: string, force = false) => {
    if (lastEventValueRef.current === message) {
      return;
    }

    const now = Date.now();
    const elapsed = now - lastEventAtRef.current;

    if (!force && elapsed < 900) {
      if (lastEventTimeoutRef.current) {
        clearTimeout(lastEventTimeoutRef.current);
      }

      lastEventTimeoutRef.current = setTimeout(() => {
        lastEventValueRef.current = message;
        lastEventAtRef.current = Date.now();
        setLastEvent(message);
      }, 900 - elapsed);
      return;
    }

    if (lastEventTimeoutRef.current) {
      clearTimeout(lastEventTimeoutRef.current);
      lastEventTimeoutRef.current = undefined;
    }

    lastEventValueRef.current = message;
    lastEventAtRef.current = now;
    setLastEvent(message);
  }, []);

  const getCurrentDurationSeconds = useCallback(() => {
    const activeSegmentMs = connectedSegmentStartedAtRef.current
      ? Date.now() - connectedSegmentStartedAtRef.current
      : 0;
    return Math.max(0, Math.floor((accumulatedConnectedMsRef.current + activeSegmentMs) / 1000));
  }, []);

  const pauseDurationTracking = useCallback(() => {
    if (!connectedSegmentStartedAtRef.current) {
      return;
    }

    accumulatedConnectedMsRef.current += Date.now() - connectedSegmentStartedAtRef.current;
    connectedSegmentStartedAtRef.current = null;
    setDurationSeconds(Math.max(0, Math.floor(accumulatedConnectedMsRef.current / 1000)));
  }, []);

  const resumeDurationTracking = useCallback(() => {
    if (connectedSegmentStartedAtRef.current) {
      return;
    }

    const now = Date.now();
    connectedSegmentStartedAtRef.current = now;
    if (!connectedAtRef.current) {
      connectedAtRef.current = now;
    }
    setDurationSeconds(getCurrentDurationSeconds());
  }, [getCurrentDurationSeconds]);

  const resetDurationTracking = useCallback(() => {
    connectedAtRef.current = null;
    connectedSegmentStartedAtRef.current = null;
    accumulatedConnectedMsRef.current = 0;
    setDurationSeconds(0);
  }, []);

  const refreshConnectionStats = useCallback(async () => {
    const pc = peerRef.current;
    if (!pc) {
      return;
    }

    try {
      const stats = await pc.getStats();
      let bytesSent = 0;
      let bytesReceived = 0;
      let selectedPair: RTCStats | null = null;

      stats.forEach((report) => {
        if (report.type === "outbound-rtp" && "bytesSent" in report && !report.isRemote) {
          bytesSent += report.bytesSent ?? 0;
        }

        if (report.type === "inbound-rtp" && "bytesReceived" in report && !report.isRemote) {
          bytesReceived += report.bytesReceived ?? 0;
        }

        if (report.type === "transport" && "selectedCandidatePairId" in report && report.selectedCandidatePairId) {
          selectedPair = stats.get(report.selectedCandidatePairId) ?? selectedPair;
        }

        if (
          report.type === "candidate-pair" &&
          (("selected" in report && report.selected) ||
            ("nominated" in report && report.nominated && report.state === "succeeded"))
        ) {
          selectedPair = report;
        }
      });

      setUsageBytes(bytesSent + bytesReceived);

      if (selectedPair && "localCandidateId" in selectedPair && "remoteCandidateId" in selectedPair) {
        const local = stats.get(selectedPair.localCandidateId);
        const remote = stats.get(selectedPair.remoteCandidateId);
        const protocol =
          (local && "protocol" in local ? local.protocol : undefined) ||
          ("protocol" in selectedPair ? selectedPair.protocol : undefined) ||
          "udp";
        const candidateType =
          (local && "candidateType" in local ? local.candidateType : undefined) ||
          "unknown";
        const remoteAddress =
          (remote && "address" in remote ? remote.address : undefined) ||
          (remote && "ip" in remote ? remote.ip : undefined) ||
          "unknown";
        const remotePort = remote && "port" in remote ? remote.port : "";
        const localUrl = local && "url" in local ? local.url : undefined;
        const remoteUrl = remote && "url" in remote ? remote.url : undefined;
        const routeHint = [localUrl, remoteUrl, remoteAddress].filter(Boolean).join(" ").toLowerCase();
        const routeLabel =
          candidateType === "relay" && routeHint.includes("expressturn")
            ? "ExpressTURN relay"
            : candidateType === "relay"
              ? "TURN relay"
              : routeHint.includes("google")
                ? "Google STUN / direct"
                : "Google STUN / direct";

        setIceRoute(`${candidateType}/${protocol} -> ${remoteAddress}${remotePort ? `:${remotePort}` : ""}`);
        setTrafficRouteLabel(routeLabel);
      }
    } catch (statsError) {
      console.error("Failed to refresh WebRTC stats:", statsError);
    }
  }, []);

  const invokeCreatePeer = useCallback(async () => {
    const createPeer = createPeerRef.current;
    if (typeof createPeer !== "function") {
      throw new Error("Voice createPeer handler is unavailable");
    }

    return createPeer();
  }, []);

  const invokeSendOffer = useCallback(async (iceRestart = false) => {
    const sendOffer = sendOfferRef.current;
    if (typeof sendOffer !== "function") {
      throw new Error("Voice sendOffer handler is unavailable");
    }

    return sendOffer(iceRestart);
  }, []);

  const destroyPeerConnection = useCallback(() => {
    if (!peerRef.current) {
      return;
    }

    peerRef.current.onicecandidate = null;
    peerRef.current.ontrack = null;
    peerRef.current.onconnectionstatechange = null;
    peerRef.current.oniceconnectionstatechange = null;
    peerRef.current.close();
    peerRef.current = null;
  }, []);

  const clearReconnectTimeout = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = undefined;
    }
  }, []);

  const markCallActive = useCallback(() => {
    if (callEstablishedRef.current) {
      resumeDurationTracking();
      return;
    }

    callEstablishedRef.current = true;
    reconnectAttemptsRef.current = 0;
    reconnectAllowedRef.current = true;
    reconnectingRef.current = false;
    clearReconnectTimeout();
    setIsReconnecting(false);
    resumeDurationTracking();
    setStatus("Звонок активен");
    void startKeepAliveAudio();
    syncMediaSession("active");
    updateLastEvent("Аудиоканал подключён", true);
    void postVoiceEvent("call-active", "Аудиоканал подключён");
    setConnecting(false);

    if (!statsRef.current) {
      void refreshConnectionStats();
      statsRef.current = setInterval(() => {
        void refreshConnectionStats();
      }, 1000);
    }
  }, [clearReconnectTimeout, postVoiceEvent, refreshConnectionStats, resumeDurationTracking, startKeepAliveAudio, syncMediaSession, updateLastEvent]);

  const restoreAudioAfterInterruption = useCallback(
    async (reason: string) => {
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
    },
    [acquireLocalAudioStream, invokeSendOffer, muted, postSignal, postVoiceEvent, role, updateLastEvent],
  );

  const bindLocalTrackLifecycle = useCallback(
    (stream: MediaStream) => {
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
    },
    [postVoiceEvent, restoreAudioAfterInterruption, updateLastEvent],
  );

  const endInviteRemotely = useCallback(async () => {
    if (endingRef.current) {
      return;
    }

    endingRef.current = true;

    await Promise.allSettled([
      postSignal("hangup", null),
      fetch(`/api/chat/voice/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
          action: "end",
          role,
          dataUsageBytes: usageBytes,
          durationSeconds: getCurrentDurationSeconds(),
        }),
      }),
    ]);
  }, [getCurrentDurationSeconds, postSignal, role, token, usageBytes]);

  const attemptReconnect = useCallback(async () => {
    if (closedRef.current || endingRef.current || reconnectingRef.current) {
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
    reconnectAttemptsRef.current += 1;
    pauseDurationTracking();
    setError(null);
    setIsReconnecting(true);
    setConnecting(true);
    setStatus(`Восстанавливаем соединение (${reconnectAttemptsRef.current}/3)...`);
    updateLastEvent(`Обрыв связи: попытка восстановления ${reconnectAttemptsRef.current}/3`, true);
    void postVoiceEvent("reconnect-attempt", "Попытка восстановления соединения", { attempt: reconnectAttemptsRef.current });

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
        void attemptReconnect();
      }, 1500);
      return;
    }

    reconnectingRef.current = false;
  }, [clearReconnectTimeout, invokeCreatePeer, invokeSendOffer, pauseDurationTracking, postSignal, postVoiceEvent, role, updateLastEvent]);

  const flushPendingCandidates = useCallback(async () => {
    const pc = peerRef.current;
    if (!pc?.remoteDescription || pendingCandidatesRef.current.length === 0) {
      return;
    }

    const candidates = [...pendingCandidatesRef.current];
    pendingCandidatesRef.current = [];

    for (const candidate of candidates) {
      try {
        await pc.addIceCandidate(candidate);
      } catch (candidateError) {
        console.error("Failed to add buffered ICE candidate:", candidateError);
      }
    }
  }, []);

  const cleanup = useCallback(
    () => {
      if (closedRef.current) {
        return;
      }

      closedRef.current = true;
      clearReconnectTimeout();
      if (lastEventTimeoutRef.current) {
        clearTimeout(lastEventTimeoutRef.current);
        lastEventTimeoutRef.current = undefined;
      }

      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = undefined;
      }

      if (statsRef.current) {
        clearInterval(statsRef.current);
        statsRef.current = undefined;
      }

      reconnectingRef.current = false;
      setIsReconnecting(false);
      destroyPeerConnection();
      void releaseWakeLock();
      stopKeepAliveAudio();
      syncMediaSession("none");

      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
        localStreamRef.current = null;
      }

      callEstablishedRef.current = false;
      resetDurationTracking();
      setUsageBytes(0);
      setIceRoute("Ищем маршрут...");
      setTrafficRouteLabel("Определяем маршрут трафика...");
    },
    [clearReconnectTimeout, destroyPeerConnection, releaseWakeLock, resetDurationTracking, stopKeepAliveAudio, syncMediaSession],
  );

  const handleVisitorRejoinRequest = useCallback(async () => {
    const now = Date.now();
    if (now - rejoinHandledAtRef.current < 1800) {
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
    setStatus("Переподключаем звонок...");
    updateLastEvent("Получен запрос на переподключение", true);
    await invokeCreatePeer();
    await invokeSendOffer(true);
  }, [invokeCreatePeer, invokeSendOffer, updateLastEvent]);

  const handleSignal = useCallback(
    async (signal: VoiceSignal) => {
      if (signal.signalType === "offer" && role === "admin") {
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
        updateLastEvent("Получен offer от посетителя", true);
        await pc.setRemoteDescription(signal.payload as RTCSessionDescriptionInit);
        reconnectAllowedRef.current = true;
        await flushPendingCandidates();
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        await postSignal("answer", answer);
        setStatus("Соединяемся...");
        return;
      }

      if (signal.signalType === "answer" && role === "visitor") {
        const pc = peerRef.current;
        if (!pc) {
          return;
        }

        if (pc.signalingState !== "have-local-offer") {
          return;
        }

        await pc.setRemoteDescription(signal.payload as RTCSessionDescriptionInit);
        reconnectAllowedRef.current = true;
        updateLastEvent("Получен answer от специалиста", true);
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

      if (signal.signalType === "rejoin-request" && role === "visitor") {
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
        onCloseRef.current();
      }
    },
    [cleanup, flushPendingCandidates, handleVisitorRejoinRequest, invokeCreatePeer, invokeSendOffer, pauseDurationTracking, postSignal, postVoiceEvent, role, updateLastEvent],
  );

  const pollSignals = useCallback(async () => {
    try {
      const res = await fetch(`/api/chat/voice/${token}/signals?after=${lastSignalIdRef.current}&role=${role}`);
      if (!res.ok) {
        return;
      }

      const signals: VoiceSignal[] = await res.json();
      for (const signal of signals) {
        lastSignalIdRef.current = Math.max(lastSignalIdRef.current, signal.id);
        await handleSignal(signal);
      }

      const inviteRes = await fetch(`/api/chat/voice/${token}`, { cache: "no-store" });
      if (inviteRes.status === 410 || inviteRes.status === 404) {
        setStatus("Звонок завершён");
        updateLastEvent("Invite завершён или истёк", true);
        setConnecting(false);
        pauseDurationTracking();
        cleanup();
        onCloseRef.current();
      }
    } catch (pollError) {
      console.error("Voice signal polling failed:", pollError);
    }
  }, [cleanup, handleSignal, pauseDurationTracking, role, token, updateLastEvent]);

  useEffect(() => {
    if (!token) {
      return;
    }

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

        if (callEstablishedRef.current || reconnectAllowedRef.current) {
          void attemptReconnect();
        }
      } else {
        void releaseWakeLock();
        void startKeepAliveAudio();
        syncMediaSession("active");
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

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    window.addEventListener("focus", handleForegroundRecovery);
    window.addEventListener("pageshow", handleForegroundRecovery);
    document.addEventListener("visibilitychange", handleForegroundRecovery);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("focus", handleForegroundRecovery);
      window.removeEventListener("pageshow", handleForegroundRecovery);
      document.removeEventListener("visibilitychange", handleForegroundRecovery);
    };
  }, [attemptReconnect, pauseDurationTracking, postVoiceEvent, releaseWakeLock, requestWakeLock, restoreAudioAfterInterruption, startKeepAliveAudio, syncMediaSession, token, updateLastEvent]);

  useEffect(() => {
    let mounted = true;

    async function start() {
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

        if (role === "visitor") {
          if (!startupJoinSentRef.current) {
            startupJoinSentRef.current = true;
            await fetch(`/api/chat/voice/${token}`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ action: "join", role }),
            });
          }
        }

        const stream = await acquireLocalAudioStream();
        if (!mounted) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        localStreamRef.current = stream;
        bindLocalTrackLifecycle(stream);
        void requestWakeLock();
        void startKeepAliveAudio();
        syncMediaSession("active");

        createPeerRef.current = async () => {
          const currentStream = localStreamRef.current;
          if (!currentStream) {
            return null;
          }

          destroyPeerConnection();
          pendingCandidatesRef.current = [];
          callEstablishedRef.current = false;
          resetDurationTracking();
          setUsageBytes(0);
          setIceRoute("Ищем маршрут...");
          setTrafficRouteLabel("Определяем маршрут трафика...");
          setConnecting(true);
          setError(null);
          setIsReconnecting(reconnectingRef.current);

          const iceConfigRes = await fetch("/api/chat/voice/ice-servers", { cache: "no-store" }).catch(() => null);
          const iceConfigJson = iceConfigRes && iceConfigRes.ok ? await iceConfigRes.json() : null;
          const iceServers = Array.isArray(iceConfigJson?.iceServers) && iceConfigJson.iceServers.length > 0
            ? iceConfigJson.iceServers
            : defaultIceServers;

          const pc = new RTCPeerConnection({
            iceServers,
            iceCandidatePoolSize: 4,
          });
          peerRef.current = pc;

          currentStream.getTracks().forEach((track) => pc.addTrack(track, currentStream));

          pc.onicecandidate = (event) => {
            if (event.candidate) {
              void postSignal("candidate", event.candidate.toJSON());
            }
          };

          pc.ontrack = (event) => {
            const [remoteStream] = event.streams;
            if (remoteAudioRef.current && remoteStream) {
              remoteAudioRef.current.srcObject = remoteStream;
              void remoteAudioRef.current.play().catch(() => undefined);
            }
            markCallActive();
          };

          pc.onconnectionstatechange = () => {
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
              void postVoiceEvent("connection-state", "WebRTC connectionState: failed");
              void attemptReconnect();
            } else if (["disconnected", "closed"].includes(pc.connectionState)) {
              pauseDurationTracking();
              updateLastEvent(`WebRTC connectionState: ${pc.connectionState}`, true);
              void postVoiceEvent("connection-state", `WebRTC connectionState: ${pc.connectionState}`);
              if (!closedRef.current && !endingRef.current) {
                void attemptReconnect();
              }
            }
          };

          pc.oniceconnectionstatechange = () => {
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
              void postVoiceEvent("ice-state", "ICE: failed");
              void attemptReconnect();
            }
          };

          return pc;
        };

        sendOfferRef.current = async (iceRestart = false) => {
          const pc = peerRef.current ?? await createPeerRef.current?.();
          if (!pc) {
            return;
          }

          if (pc.signalingState !== "stable") {
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

        await invokeCreatePeer();

        if (role === "visitor" && pendingVisitorRejoinRef.current) {
          await handleVisitorRejoinRequest();
        }

        pollRef.current = setInterval(pollSignals, 1200);

        if (role === "visitor" && !joinedRef.current) {
          joinedRef.current = true;
          if (!initialOfferSentRef.current) {
            initialOfferSentRef.current = true;
            await invokeSendOffer(false);
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

    void start();

    return () => {
      mounted = false;
      createPeerRef.current = null;
      sendOfferRef.current = null;
      cleanup();
    };
  }, [acquireLocalAudioStream, attemptReconnect, bindLocalTrackLifecycle, cleanup, counterpartLabel, destroyPeerConnection, handleVisitorRejoinRequest, invokeCreatePeer, invokeSendOffer, markCallActive, pauseDurationTracking, pollSignals, postSignal, postVoiceEvent, requestWakeLock, resetDurationTracking, resumeDurationTracking, role, startKeepAliveAudio, syncMediaSession, token, updateLastEvent]);

  useEffect(() => {
    if (!onStatsChange) {
      return;
    }

    const isRelay = trafficRouteLabel.toLowerCase().includes("relay");
    onStatsChange({
      durationSeconds,
      usageBytes,
      liveServerBytes: isRelay ? usageBytes * 2 : 0,
      trafficRouteLabel,
      iceRoute,
      connected: callEstablishedRef.current && !connecting,
    });
  }, [connecting, durationSeconds, iceRoute, onStatsChange, trafficRouteLabel, usageBytes]);

  useEffect(() => {
    return () => {
      if (onStatsChange) {
        onStatsChange(null);
      }
    };
  }, [onStatsChange]);

  const toggleMute = () => {
    const track = localStreamRef.current?.getAudioTracks()[0];
    if (!track) {
      return;
    }

    track.enabled = !track.enabled;
    setMuted(!track.enabled);
  };

  const handleEnd = async () => {
    updateLastEvent("Вы завершили звонок", true);
    void postVoiceEvent("local-hangup", "Пользователь завершил звонок");
    await endInviteRemotely();
    cleanup();
    onCloseRef.current();
  };

  return (
    <div className="absolute inset-0 z-20 bg-white/95 backdrop-blur-xl p-6 flex flex-col">
      <audio ref={remoteAudioRef} autoPlay playsInline />
      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <div className="w-24 h-24 rounded-full bg-forest text-white flex items-center justify-center shadow-[0_24px_60px_rgba(45,63,45,0.18)] mb-6">
          {connecting ? <Loader2 className="h-10 w-10 animate-spin" /> : <Radio className="h-10 w-10" />}
        </div>
        <p className="text-xs font-bold uppercase tracking-[0.35em] text-forest/35 mb-3">Voice Mode</p>
        <h4 className="text-2xl font-bold text-forest tracking-tight mb-2">{title}</h4>
        <p className="text-sm text-forest/55 max-w-xs leading-relaxed">{error ?? status}</p>
        {isReconnecting ? (
          <div className="mt-3 rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.2em] text-amber-700">
            Восстанавливаем соединение...
          </div>
        ) : null}

        <div className="mt-8 w-full max-w-sm rounded-[2rem] border border-sage-light/20 bg-cream/35 p-4 text-left shadow-sm">
          {role === "admin" ? (
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-[1.25rem] bg-white/80 px-4 py-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-forest/35">Длительность</p>
                <p className="mt-1 text-base font-bold text-forest">{formatDuration(durationSeconds)}</p>
              </div>
              <div className="rounded-[1.25rem] bg-white/80 px-4 py-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-forest/35">Трафик</p>
                <p className="mt-1 text-base font-bold text-forest">{formatUsage(usageBytes)}</p>
                <p className="mt-1 text-[11px] text-forest/45">{((usageBytes / MONTHLY_CAP_BYTES) * 100).toFixed(4)}% из 1000 GB</p>
              </div>
            </div>
          ) : (
            <div className="rounded-[1.25rem] bg-white/80 px-4 py-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-forest/35">Общая длительность</p>
              <p className="mt-1 text-base font-bold text-forest">{formatDuration(durationSeconds)}</p>
              <p className="mt-1 text-[11px] text-forest/45">Пауза ставится автоматически, если связь временно прерывается.</p>
            </div>
          )}
          {role === "admin" ? (
            <>
              <div className="mt-3 rounded-[1.25rem] bg-white/80 px-4 py-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-forest/35">Маршрут трафика</p>
                <p className="mt-1 text-sm font-medium text-forest">{trafficRouteLabel}</p>
              </div>
              <div className="mt-3 rounded-[1.25rem] bg-white/80 px-4 py-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-forest/35">ICE Route</p>
                <p className="mt-1 text-sm font-medium text-forest break-all">{iceRoute}</p>
              </div>
            </>
          ) : null}
          <div className="mt-3 rounded-[1.25rem] bg-white/80 px-4 py-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-forest/35">Последний статус</p>
            <p className="mt-1 text-sm font-medium text-forest">{lastEvent}</p>
          </div>
        </div>
      </div>

      <div className="rounded-[2rem] border border-sage-light/20 bg-cream/40 p-4 flex items-center justify-center gap-4">
        <button
          onClick={toggleMute}
          className="h-14 w-14 rounded-full bg-white text-forest border border-sage-light/20 shadow-sm flex items-center justify-center transition hover:bg-sage-light/10"
          type="button"
        >
          {muted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
        </button>
        <button
          onClick={handleEnd}
          className="h-16 w-16 rounded-full bg-red-500 text-white shadow-lg shadow-red-500/20 flex items-center justify-center transition hover:bg-red-600"
          type="button"
        >
          <PhoneOff className="h-7 w-7" />
        </button>
        <div className="h-14 w-14 rounded-full bg-forest/10 text-forest flex items-center justify-center">
          <Phone className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
}
