import { SILENT_KEEPALIVE_AUDIO } from "./constants";
import type { WakeLockSentinelLike } from "./types";

type AudioRefLike = {
  current: HTMLAudioElement | null;
};

type WakeLockRefLike = {
  current: WakeLockSentinelLike | null;
};

type MediaSessionState = "none" | "active";

type SyncMediaSessionParams = {
  state: MediaSessionState;
  title: string;
  role: "admin" | "visitor";
  onClose: () => void;
  startKeepAliveAudio: () => Promise<void>;
};

function wait(ms: number) {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });
}

export function normalizeVoiceMediaError(error: unknown) {
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
}

export async function acquireVoiceAudioStream() {
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

  throw new Error(normalizeVoiceMediaError(lastError));
}

export function stopVoiceKeepAliveAudio(audioRef: AudioRefLike) {
  const audio = audioRef.current;
  if (!audio) {
    return;
  }

  audio.pause();
  audio.src = "";
  audioRef.current = null;
}

export async function startVoiceKeepAliveAudio(audioRef: AudioRefLike) {
  if (typeof window === "undefined") {
    return;
  }

  let audio = audioRef.current;
  if (!audio) {
    audio = new Audio(SILENT_KEEPALIVE_AUDIO);
    audio.loop = true;
    audio.playsInline = true;
    audio.preload = "auto";
    audio.volume = 0.001;
    audioRef.current = audio;
  }

  try {
    await audio.play();
  } catch {
    // keep-alive audio is best effort only
  }
}

export function syncVoiceMediaSession({
  state,
  title,
  role,
  onClose,
  startKeepAliveAudio,
}: SyncMediaSessionParams) {
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
    void onClose();
  });
  mediaSession.setActionHandler("stop", () => {
    void onClose();
  });
}

export async function releaseVoiceWakeLock(wakeLockRef: WakeLockRefLike) {
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
}

export async function requestVoiceWakeLock(wakeLockRef: WakeLockRefLike) {
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
}
