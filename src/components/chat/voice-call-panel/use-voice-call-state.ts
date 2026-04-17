"use client";

import { useState } from "react";

import { INITIAL_ICE_ROUTE, INITIAL_TRAFFIC_ROUTE_LABEL } from "./constants";

export function useVoiceCallState() {
  const [status, setStatus] = useState("\u0413\u043e\u0442\u043e\u0432\u0438\u043c \u0430\u0443\u0434\u0438\u043e...");
  const [error, setError] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(true);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [muted, setMuted] = useState(false);
  const [usageBytes, setUsageBytes] = useState(0);
  const [iceRoute, setIceRoute] = useState(INITIAL_ICE_ROUTE);
  const [trafficRouteLabel, setTrafficRouteLabel] = useState(INITIAL_TRAFFIC_ROUTE_LABEL);

  return {
    status,
    setStatus,
    error,
    setError,
    connecting,
    setConnecting,
    isReconnecting,
    setIsReconnecting,
    muted,
    setMuted,
    usageBytes,
    setUsageBytes,
    iceRoute,
    setIceRoute,
    trafficRouteLabel,
    setTrafficRouteLabel,
  };
}
