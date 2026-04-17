"use client";

import { useCallback } from "react";

import { acquireVoiceAudioStream } from "./media";

export function useVoiceCallLocalAudioStream() {
  return useCallback(async () => acquireVoiceAudioStream(), []);
}
