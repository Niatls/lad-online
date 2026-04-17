import { SILENT_KEEPALIVE_AUDIO } from "./constants";

type AudioRefLike = {
  current: HTMLAudioElement | null;
};

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
