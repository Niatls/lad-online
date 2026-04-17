type AudioRefLike = {
  current: HTMLAudioElement | null;
};

export function stopVoiceKeepAliveAudio(audioRef: AudioRefLike) {
  const audio = audioRef.current;
  if (!audio) {
    return;
  }

  audio.pause();
  audio.src = "";
  audioRef.current = null;
}
