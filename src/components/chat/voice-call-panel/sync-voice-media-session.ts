type MediaSessionState = "none" | "active";

type SyncMediaSessionParams = {
  state: MediaSessionState;
  title: string;
  role: "admin" | "visitor";
  onClose: () => void;
  startKeepAliveAudio: () => Promise<void>;
};

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
