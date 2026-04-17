"use client";

import { useCallback } from "react";

type UseVoiceCallActiveStateParams = {
  callEstablishedRef: React.MutableRefObject<boolean>;
  clearReconnectTimeout: () => void;
  lastReconnectStartedAtRef: React.MutableRefObject<number>;
  postVoiceEvent: (eventType: string, message: string, details?: unknown) => Promise<void>;
  reconnectAllowedRef: React.MutableRefObject<boolean>;
  reconnectAttemptsRef: React.MutableRefObject<number>;
  reconnectingRef: React.MutableRefObject<boolean>;
  refreshConnectionStats: () => Promise<void>;
  resumeDurationTracking: () => void;
  setConnecting: React.Dispatch<React.SetStateAction<boolean>>;
  setIsReconnecting: React.Dispatch<React.SetStateAction<boolean>>;
  setStatus: React.Dispatch<React.SetStateAction<string>>;
  startKeepAliveAudio: () => Promise<void>;
  statsRef: React.MutableRefObject<ReturnType<typeof setInterval> | undefined>;
  syncMediaSession: (state: "none" | "active") => void;
  updateLastEvent: (message: string, force?: boolean) => void;
};

export function useVoiceCallActiveState({
  callEstablishedRef,
  clearReconnectTimeout,
  lastReconnectStartedAtRef,
  postVoiceEvent,
  reconnectAllowedRef,
  reconnectAttemptsRef,
  reconnectingRef,
  refreshConnectionStats,
  resumeDurationTracking,
  setConnecting,
  setIsReconnecting,
  setStatus,
  startKeepAliveAudio,
  statsRef,
  syncMediaSession,
  updateLastEvent,
}: UseVoiceCallActiveStateParams) {
  return useCallback(() => {
    if (callEstablishedRef.current) {
      resumeDurationTracking();
      return;
    }

    callEstablishedRef.current = true;
    reconnectAttemptsRef.current = 0;
    lastReconnectStartedAtRef.current = 0;
    reconnectAllowedRef.current = true;
    reconnectingRef.current = false;
    clearReconnectTimeout();
    setIsReconnecting(false);
    resumeDurationTracking();
    setStatus("\u0417\u0432\u043e\u043d\u043e\u043a \u0430\u043a\u0442\u0438\u0432\u0435\u043d");
    void startKeepAliveAudio();
    syncMediaSession("active");
    updateLastEvent("\u0410\u0443\u0434\u0438\u043e\u043a\u0430\u043d\u0430\u043b \u043f\u043e\u0434\u043a\u043b\u044e\u0447\u0451\u043d", true);
    void postVoiceEvent("call-active", "\u0410\u0443\u0434\u0438\u043e\u043a\u0430\u043d\u0430\u043b \u043f\u043e\u0434\u043a\u043b\u044e\u0447\u0451\u043d");
    setConnecting(false);

    if (!statsRef.current) {
      void refreshConnectionStats();
      statsRef.current = setInterval(() => {
        void refreshConnectionStats();
      }, 1000);
    }
  }, [
    callEstablishedRef,
    clearReconnectTimeout,
    lastReconnectStartedAtRef,
    postVoiceEvent,
    reconnectAllowedRef,
    reconnectAttemptsRef,
    reconnectingRef,
    refreshConnectionStats,
    resumeDurationTracking,
    setConnecting,
    setIsReconnecting,
    setStatus,
    startKeepAliveAudio,
    statsRef,
    syncMediaSession,
    updateLastEvent,
  ]);
}
