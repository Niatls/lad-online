"use client";

import { useCallback } from "react";

export function useVoiceCallClearTimeout(
  reconnectTimeoutRef: React.MutableRefObject<ReturnType<typeof setTimeout> | undefined>,
) {
  return useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = undefined;
    }
  }, [reconnectTimeoutRef]);
}
