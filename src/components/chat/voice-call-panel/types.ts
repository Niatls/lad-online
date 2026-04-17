export type VoiceCallPanelProps = {
  token: string;
  role: "admin" | "visitor";
  title: string;
  onClose: () => void;
  onStatsChange?: (stats: {
    durationSeconds: number;
    usageBytes: number;
    liveServerBytes: number;
    trafficRouteLabel: string;
    iceRoute: string;
    connected: boolean;
  } | null) => void;
};

export type VoiceSignal = {
  id: number;
  senderRole: string;
  signalType: string;
  payload: unknown;
  createdAt: string;
};

export type IceServer = {
  urls: string | string[];
  username?: string;
  credential?: string;
};

export type VoicePeerDiagnostics = {
  connectionState?: RTCPeerConnectionState;
  iceConnectionState?: RTCIceConnectionState;
  iceGatheringState?: RTCIceGatheringState;
  signalingState?: RTCSignalingState;
  iceRoute?: string;
  trafficRouteLabel?: string;
  selectedCandidateType?: string;
  selectedProtocol?: string;
  localCandidateType?: string;
  localCandidateAddress?: string;
  remoteCandidateType?: string;
  remoteCandidateAddress?: string;
  remoteCandidatePort?: number | string;
  relayOnly?: boolean;
};

export type WakeLockSentinelLike = {
  released: boolean;
  release: () => Promise<void>;
};
