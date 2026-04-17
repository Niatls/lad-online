"use client";

import { useEffect } from "react";

type UseVoiceCallSessionResetParams = {
  initialOfferSentRef: React.MutableRefObject<boolean>;
  reconnectAllowedRef: React.MutableRefObject<boolean>;
  role: "admin" | "visitor";
  startupJoinSentRef: React.MutableRefObject<boolean>;
  token: string;
};

export function useVoiceCallSessionReset({
  initialOfferSentRef,
  reconnectAllowedRef,
  role,
  startupJoinSentRef,
  token,
}: UseVoiceCallSessionResetParams) {
  useEffect(() => {
    startupJoinSentRef.current = false;
    initialOfferSentRef.current = false;
    reconnectAllowedRef.current = false;
  }, [initialOfferSentRef, reconnectAllowedRef, role, startupJoinSentRef, token]);
}
