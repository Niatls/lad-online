"use client";

import { useEffect, useState } from "react";

type UseAudioWaveformParams = {
  barCount: number;
  source: Blob | string | null;
};

function getInitialBars(barCount: number) {
  return Array.from({ length: barCount }, (_, index) => 10 + ((index * 7) % 10));
}

function buildWaveform(channelData: Float32Array, barCount: number) {
  if (!channelData.length) {
    return getInitialBars(barCount);
  }

  const blockSize = Math.max(1, Math.floor(channelData.length / barCount));

  return Array.from({ length: barCount }, (_, index) => {
    const start = index * blockSize;
    const end = Math.min(channelData.length, start + blockSize);

    let sum = 0;
    for (let position = start; position < end; position += 1) {
      sum += Math.abs(channelData[position] ?? 0);
    }

    const average = end > start ? sum / (end - start) : 0;
    return 8 + Math.max(2, Math.round(average * 52));
  });
}

export function useAudioWaveform({
  barCount,
  source,
}: UseAudioWaveformParams) {
  const [levels, setLevels] = useState<number[]>(() => getInitialBars(barCount));

  useEffect(() => {
    if (!source) {
      setLevels(getInitialBars(barCount));
      return;
    }

    const AudioContextCtor =
      window.AudioContext ||
      (window as typeof window & { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;

    if (!AudioContextCtor) {
      setLevels(getInitialBars(barCount));
      return;
    }

    let cancelled = false;
    const audioContext = new AudioContextCtor();

    const loadWaveform = async () => {
      try {
        const arrayBuffer =
          typeof source === "string"
            ? await fetch(source).then(async (response) => {
                if (!response.ok) {
                  throw new Error("Failed to load audio");
                }

                return response.arrayBuffer();
              })
            : await source.arrayBuffer();

        const decodedBuffer = await audioContext.decodeAudioData(arrayBuffer);
        if (cancelled) {
          return;
        }

        setLevels(buildWaveform(decodedBuffer.getChannelData(0), barCount));
      } catch (error) {
        console.error("Failed to build audio waveform:", error);
        if (!cancelled) {
          setLevels(getInitialBars(barCount));
        }
      }
    };

    void loadWaveform();

    return () => {
      cancelled = true;
      void audioContext.close().catch(() => undefined);
    };
  }, [barCount, source]);

  return levels;
}
