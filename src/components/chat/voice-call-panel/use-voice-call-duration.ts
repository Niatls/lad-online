"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export function useVoiceCallDuration() {
  const [durationSeconds, setDurationSeconds] = useState(0);
  const connectedAtRef = useRef<number | null>(null);
  const connectedSegmentStartedAtRef = useRef<number | null>(null);
  const accumulatedConnectedMsRef = useRef(0);

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

  useEffect(() => {
    const interval = setInterval(() => {
      const activeSegmentMs = connectedSegmentStartedAtRef.current
        ? Date.now() - connectedSegmentStartedAtRef.current
        : 0;
      setDurationSeconds(Math.max(0, Math.floor((accumulatedConnectedMsRef.current + activeSegmentMs) / 1000)));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return {
    durationSeconds,
    getCurrentDurationSeconds,
    pauseDurationTracking,
    resumeDurationTracking,
    resetDurationTracking,
  };
}
