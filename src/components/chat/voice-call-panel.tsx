"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Loader2, Mic, MicOff, Phone, PhoneOff, Radio } from "lucide-react";

type VoiceCallPanelProps = {
  token: string;
  role: "admin" | "visitor";
  title: string;
  onClose: () => void;
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

const defaultIceServers: IceServer[] = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun1.l.google.com:19302" },
];

const MONTHLY_CAP_BYTES = 1000 * 1024 * 1024 * 1024;

export function VoiceCallPanel({ token, role, title, onClose }: VoiceCallPanelProps) {
  const [status, setStatus] = useState("Готовим аудио...");
  const [error, setError] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(true);
  const [muted, setMuted] = useState(false);
  const [durationSeconds, setDurationSeconds] = useState(0);
  const [usageBytes, setUsageBytes] = useState(0);
  const [iceRoute, setIceRoute] = useState("Ищем маршрут...");
  const localStreamRef = useRef<MediaStream | null>(null);
  const peerRef = useRef<RTCPeerConnection | null>(null);
  const remoteAudioRef = useRef<HTMLAudioElement | null>(null);
  const lastSignalIdRef = useRef(0);
  const pollRef = useRef<ReturnType<typeof setInterval>>(undefined);
  const statsRef = useRef<ReturnType<typeof setInterval>>(undefined);
  const pendingCandidatesRef = useRef<RTCIceCandidateInit[]>([]);
  const joinedRef = useRef(false);
  const connectedAtRef = useRef<number | null>(null);

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
        setIceRoute(`${candidateType}/${protocol} -> ${remoteAddress}${remotePort ? `:${remotePort}` : ""}`);
      }

      if (connectedAtRef.current) {
        setDurationSeconds(Math.max(0, Math.floor((Date.now() - connectedAtRef.current) / 1000)));
      }
    } catch (statsError) {
      console.error("Failed to refresh WebRTC stats:", statsError);
    }
  }, []);

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
    (notifyRemote: boolean) => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = undefined;
      }

      if (statsRef.current) {
        clearInterval(statsRef.current);
        statsRef.current = undefined;
      }

      if (notifyRemote) {
        void postSignal("hangup", null);
        void fetch(`/api/chat/voice/${token}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "end" }),
        }).catch(() => undefined);
      }

      if (peerRef.current) {
        peerRef.current.onicecandidate = null;
        peerRef.current.ontrack = null;
        peerRef.current.onconnectionstatechange = null;
        peerRef.current.oniceconnectionstatechange = null;
        peerRef.current.close();
        peerRef.current = null;
      }

      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
        localStreamRef.current = null;
      }

      connectedAtRef.current = null;
    },
    [postSignal, token],
  );

  const handleSignal = useCallback(
    async (signal: VoiceSignal) => {
      const pc = peerRef.current;
      if (!pc) {
        return;
      }

      if (signal.signalType === "offer" && role === "admin") {
        setStatus("Входящий звонок. Подключаем аудио...");
        await pc.setRemoteDescription(signal.payload as RTCSessionDescriptionInit);
        await flushPendingCandidates();
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        await postSignal("answer", answer);
        setStatus("Соединяемся...");
        return;
      }

      if (signal.signalType === "answer" && role === "visitor") {
        await pc.setRemoteDescription(signal.payload as RTCSessionDescriptionInit);
        await flushPendingCandidates();
        setStatus("Соединяемся...");
        return;
      }

      if (signal.signalType === "candidate") {
        const candidate = signal.payload as RTCIceCandidateInit;
        if (pc.remoteDescription) {
          await pc.addIceCandidate(candidate);
        } else {
          pendingCandidatesRef.current.push(candidate);
        }
        return;
      }

      if (signal.signalType === "hangup") {
        setStatus("Звонок завершён");
        setConnecting(false);
        cleanup(false);
      }
    },
    [cleanup, flushPendingCandidates, postSignal, role],
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
    } catch (pollError) {
      console.error("Voice signal polling failed:", pollError);
    }
  }, [handleSignal, role, token]);

  useEffect(() => {
    let mounted = true;

    async function start() {
      try {
        const inviteRes = await fetch(`/api/chat/voice/${token}`);
        if (!inviteRes.ok) {
          throw new Error("Приглашение на звонок больше недоступно.");
        }

        await fetch(`/api/chat/voice/${token}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "join" }),
        });

        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        if (!mounted) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        localStreamRef.current = stream;

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

        stream.getTracks().forEach((track) => pc.addTrack(track, stream));

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
        };

        pc.onconnectionstatechange = () => {
          if (pc.connectionState === "connected") {
            setStatus("Звонок активен");
            setConnecting(false);
            connectedAtRef.current ??= Date.now();
            if (!statsRef.current) {
              void refreshConnectionStats();
              statsRef.current = setInterval(() => {
                void refreshConnectionStats();
              }, 1000);
            }
          } else if (pc.connectionState === "connecting") {
            setStatus("Соединяем аудиоканал...");
          } else if (pc.connectionState === "failed") {
            setStatus("Не удалось установить аудиосоединение");
            setError("Похоже, прямое WebRTC-соединение недоступно. Попробуйте ещё раз.");
            setConnecting(false);
          } else if (["disconnected", "closed"].includes(pc.connectionState)) {
            setStatus("Соединение завершено");
            setConnecting(false);
          }
        };

        pc.oniceconnectionstatechange = () => {
          if (pc.iceConnectionState === "checking") {
            setStatus("Проверяем маршрут для звонка...");
          } else if (pc.iceConnectionState === "connected" || pc.iceConnectionState === "completed") {
            setStatus("Звонок активен");
            setConnecting(false);
            connectedAtRef.current ??= Date.now();
            if (!statsRef.current) {
              void refreshConnectionStats();
              statsRef.current = setInterval(() => {
                void refreshConnectionStats();
              }, 1000);
            }
          } else if (pc.iceConnectionState === "failed") {
            setStatus("ICE-маршрут не поднялся");
            setError("Маршрут для аудиозвонка не установился. Попробуйте начать звонок заново.");
            setConnecting(false);
          }
        };

        pollRef.current = setInterval(pollSignals, 1200);

        if (role === "visitor" && !joinedRef.current) {
          joinedRef.current = true;
          const offer = await pc.createOffer({ offerToReceiveAudio: true });
          await pc.setLocalDescription(offer);
          await postSignal("offer", offer);
          setStatus("Вызываем специалиста...");
        } else {
          setStatus(`Ждём звонок от ${counterpartLabel}...`);
          joinedRef.current = true;
        }
      } catch (startError) {
        console.error("Voice call init failed:", startError);
        setError(startError instanceof Error ? startError.message : "Не удалось запустить звонок.");
        setConnecting(false);
      }
    }

    void start();

    return () => {
      mounted = false;
      cleanup(false);
    };
  }, [cleanup, counterpartLabel, pollSignals, postSignal, refreshConnectionStats, role, token]);

  const toggleMute = () => {
    const track = localStreamRef.current?.getAudioTracks()[0];
    if (!track) {
      return;
    }

    track.enabled = !track.enabled;
    setMuted(!track.enabled);
  };

  const handleEnd = () => {
    cleanup(true);
    onClose();
  };

  return (
    <div className="absolute inset-0 z-20 bg-white/95 backdrop-blur-xl p-6 flex flex-col">
      <audio ref={remoteAudioRef} autoPlay />
      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <div className="w-24 h-24 rounded-full bg-forest text-white flex items-center justify-center shadow-[0_24px_60px_rgba(45,63,45,0.18)] mb-6">
          {connecting ? <Loader2 className="h-10 w-10 animate-spin" /> : <Radio className="h-10 w-10" />}
        </div>
        <p className="text-xs font-bold uppercase tracking-[0.35em] text-forest/35 mb-3">Voice Mode</p>
        <h4 className="text-2xl font-bold text-forest tracking-tight mb-2">{title}</h4>
        <p className="text-sm text-forest/55 max-w-xs leading-relaxed">{error ?? status}</p>

        <div className="mt-8 w-full max-w-sm rounded-[2rem] border border-sage-light/20 bg-cream/35 p-4 text-left shadow-sm">
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
          <div className="mt-3 rounded-[1.25rem] bg-white/80 px-4 py-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-forest/35">ICE Route</p>
            <p className="mt-1 text-sm font-medium text-forest break-all">{iceRoute}</p>
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
