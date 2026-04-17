import { normalizeVoiceMediaError } from "./normalize-voice-media-error";

function wait(ms: number) {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });
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
