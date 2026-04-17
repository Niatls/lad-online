"use client";

import { useCallback } from "react";

import { bindVoiceLocalTrackLifecycle } from "./audio-lifecycle";

type UseVoiceCallTrackLifecycleParams = {
  postVoiceEvent: (eventType: string, message: string, details?: unknown) => Promise<void>;
  restoreAudioAfterInterruption: (reason: string) => Promise<void>;
  updateLastEvent: (message: string, force?: boolean) => void;
};

export function useVoiceCallTrackLifecycle({
  postVoiceEvent,
  restoreAudioAfterInterruption,
  updateLastEvent,
}: UseVoiceCallTrackLifecycleParams) {
  return useCallback(
    (stream: MediaStream) => {
      bindVoiceLocalTrackLifecycle({
        stream,
        updateLastEvent,
        postVoiceEvent,
        restoreAudioAfterInterruption,
      });
    },
    [postVoiceEvent, restoreAudioAfterInterruption, updateLastEvent],
  );
}
