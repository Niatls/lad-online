"use client";

import { useCallback, useRef, useState } from "react";

export function useVoiceLastEvent() {
  const [lastEvent, setLastEvent] = useState("\u0418\u043d\u0438\u0446\u0438\u0430\u043b\u0438\u0437\u0430\u0446\u0438\u044f \u0437\u0432\u043e\u043d\u043a\u0430");
  const lastEventAtRef = useRef(0);
  const lastEventValueRef = useRef("\u0418\u043d\u0438\u0446\u0438\u0430\u043b\u0438\u0437\u0430\u0446\u0438\u044f \u0437\u0432\u043e\u043d\u043a\u0430");
  const lastEventTimeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const clearPendingLastEvent = useCallback(() => {
    if (!lastEventTimeoutRef.current) {
      return;
    }

    clearTimeout(lastEventTimeoutRef.current);
    lastEventTimeoutRef.current = undefined;
  }, []);

  const updateLastEvent = useCallback((message: string, force = false) => {
    if (lastEventValueRef.current === message) {
      return;
    }

    const now = Date.now();
    const elapsed = now - lastEventAtRef.current;

    if (!force && elapsed < 900) {
      clearPendingLastEvent();
      lastEventTimeoutRef.current = setTimeout(() => {
        lastEventValueRef.current = message;
        lastEventAtRef.current = Date.now();
        setLastEvent(message);
      }, 900 - elapsed);
      return;
    }

    clearPendingLastEvent();
    lastEventValueRef.current = message;
    lastEventAtRef.current = now;
    setLastEvent(message);
  }, [clearPendingLastEvent]);

  return {
    lastEvent,
    updateLastEvent,
    clearPendingLastEvent,
  };
}
