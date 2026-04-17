"use client";

import { useCallback } from "react";

import { endVoiceInvite } from "./signaling";

type UseVoiceCallActionsParams = {
  cleanup: () => void;
  endingRef: React.MutableRefObject<boolean>;
  getCurrentDurationSeconds: () => number;
  localStreamRef: React.MutableRefObject<MediaStream | null>;
  onCloseRef: React.MutableRefObject<() => void>;
  postSignal: (signalType: string, payload: unknown) => Promise<void>;
  postVoiceEvent: (eventType: string, message: string, details?: unknown) => Promise<void>;
  role: "admin" | "visitor";
  setMuted: React.Dispatch<React.SetStateAction<boolean>>;
  token: string;
  updateLastEvent: (message: string, force?: boolean) => void;
  usageBytes: number;
};

export function useVoiceCallActions({
  cleanup,
  endingRef,
  getCurrentDurationSeconds,
  localStreamRef,
  onCloseRef,
  postSignal,
  postVoiceEvent,
  role,
  setMuted,
  token,
  updateLastEvent,
  usageBytes,
}: UseVoiceCallActionsParams) {
  const toggleMute = useCallback(() => {
    const track = localStreamRef.current?.getAudioTracks()[0];
    if (!track) {
      return;
    }

    track.enabled = !track.enabled;
    setMuted(!track.enabled);
  }, [localStreamRef, setMuted]);

  const endInviteRemotely = useCallback(async () => {
    if (endingRef.current) {
      return;
    }

    endingRef.current = true;
    await endVoiceInvite({
      token,
      role,
      usageBytes,
      durationSeconds: getCurrentDurationSeconds(),
      postSignal,
    });
  }, [endingRef, getCurrentDurationSeconds, postSignal, role, token, usageBytes]);

  const handleEnd = useCallback(async () => {
    updateLastEvent("\u0412\u044b \u0437\u0430\u0432\u0435\u0440\u0448\u0438\u043b\u0438 \u0437\u0432\u043e\u043d\u043e\u043a", true);
    void postVoiceEvent("local-hangup", "\u041f\u043e\u043b\u044c\u0437\u043e\u0432\u0430\u0442\u0435\u043b\u044c \u0437\u0430\u0432\u0435\u0440\u0448\u0438\u043b \u0437\u0432\u043e\u043d\u043e\u043a");
    await endInviteRemotely();
    cleanup();
    onCloseRef.current();
  }, [cleanup, endInviteRemotely, onCloseRef, postVoiceEvent, updateLastEvent]);

  return {
    toggleMute,
    handleEnd,
  };
}
