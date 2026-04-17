"use client";

import { useEffect } from "react";

type UseVoiceCallStatsChangeParams = {
  callEstablishedRef: React.MutableRefObject<boolean>;
  connecting: boolean;
  durationSeconds: number;
  iceRoute: string;
  onStatsChange?: (stats: {
    durationSeconds: number;
    usageBytes: number;
    liveServerBytes: number;
    trafficRouteLabel: string;
    iceRoute: string;
    connected: boolean;
  } | null) => void;
  trafficRouteLabel: string;
  usageBytes: number;
};

export function useVoiceCallStatsChange({
  callEstablishedRef,
  connecting,
  durationSeconds,
  iceRoute,
  onStatsChange,
  trafficRouteLabel,
  usageBytes,
}: UseVoiceCallStatsChangeParams) {
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
  }, [callEstablishedRef, connecting, durationSeconds, iceRoute, onStatsChange, trafficRouteLabel, usageBytes]);

  useEffect(() => {
    return () => {
      if (onStatsChange) {
        onStatsChange(null);
      }
    };
  }, [onStatsChange]);
}
