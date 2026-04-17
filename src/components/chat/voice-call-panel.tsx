"use client";

import { VoiceControlBar } from "./voice-call-panel/control-bar";
import { VoiceInfoPanel } from "./voice-call-panel/info-panel";
import type { VoiceCallPanelProps } from "./voice-call-panel/types";
import { useVoiceCallPanel } from "./voice-call-panel/use-voice-call-panel";

export function VoiceCallPanel({ token, role, title, onClose, onStatsChange }: VoiceCallPanelProps) {
  const {
    remoteAudioRef,
    connecting,
    durationLabel,
    error,
    handleEnd,
    iceRoute,
    isReconnecting,
    lastEvent,
    muted,
    status,
    toggleMute,
    trafficRouteLabel,
    usageBytes,
    usageLabel,
  } = useVoiceCallPanel({
    token,
    role,
    title,
    onClose,
    onStatsChange,
  });

  return (
    <div className="absolute inset-0 z-20 bg-white/95 backdrop-blur-xl p-6 flex flex-col">
      <audio ref={remoteAudioRef} autoPlay playsInline />
      <VoiceInfoPanel
        connecting={connecting}
        durationLabel={durationLabel}
        error={error}
        iceRoute={iceRoute}
        isReconnecting={isReconnecting}
        lastEvent={lastEvent}
        role={role}
        status={status}
        title={title}
        trafficRouteLabel={trafficRouteLabel}
        usageBytes={usageBytes}
        usageLabel={usageLabel}
      />

      <VoiceControlBar
        muted={muted}
        onEnd={() => {
          void handleEnd();
        }}
        onToggleMute={toggleMute}
      />
    </div>
  );
}
