import { INITIAL_ICE_ROUTE, INITIAL_TRAFFIC_ROUTE_LABEL } from "./constants";
import type { VoicePeerDiagnostics } from "./types";

type PeerRefLike = {
  current: RTCPeerConnection | null;
};

export type VoiceConnectionStatsSnapshot = {
  usageBytes: number;
  iceRoute: string;
  trafficRouteLabel: string;
};

export async function collectVoiceConnectionStats(pc: RTCPeerConnection): Promise<VoiceConnectionStatsSnapshot> {
  const stats = await pc.getStats();
  let bytesSent = 0;
  let bytesReceived = 0;
  let selectedPair: RTCStats | null = null;

  stats.forEach((report) => {
    if (report.type === "outbound-rtp" && "bytesSent" in report && !report.isRemote) {
      bytesSent += report.bytesSent ?? 0;
    }

    if (report.type === "inbound-rtp" && "bytesReceived" in report && !report.isRemote) {
      bytesReceived += report.bytesReceived ?? 0;
    }

    if (report.type === "transport" && "selectedCandidatePairId" in report && report.selectedCandidatePairId) {
      selectedPair = stats.get(report.selectedCandidatePairId) ?? selectedPair;
    }

    if (
      report.type === "candidate-pair" &&
      (("selected" in report && report.selected) ||
        ("nominated" in report && report.nominated && report.state === "succeeded"))
    ) {
      selectedPair = report;
    }
  });

  if (!selectedPair || !("localCandidateId" in selectedPair) || !("remoteCandidateId" in selectedPair)) {
    return {
      usageBytes: bytesSent + bytesReceived,
      iceRoute: INITIAL_ICE_ROUTE,
      trafficRouteLabel: INITIAL_TRAFFIC_ROUTE_LABEL,
    };
  }

  const local = stats.get(selectedPair.localCandidateId);
  const remote = stats.get(selectedPair.remoteCandidateId);
  const protocol =
    (local && "protocol" in local ? local.protocol : undefined) ||
    ("protocol" in selectedPair ? selectedPair.protocol : undefined) ||
    "udp";
  const candidateType =
    (local && "candidateType" in local ? local.candidateType : undefined) ||
    "unknown";
  const remoteAddress =
    (remote && "address" in remote ? remote.address : undefined) ||
    (remote && "ip" in remote ? remote.ip : undefined) ||
    "unknown";
  const remotePort = remote && "port" in remote ? remote.port : "";
  const localUrl = local && "url" in local ? local.url : undefined;
  const remoteUrl = remote && "url" in remote ? remote.url : undefined;
  const routeHint = [localUrl, remoteUrl, remoteAddress].filter(Boolean).join(" ").toLowerCase();
  const routeLabel =
    candidateType === "relay" && routeHint.includes("expressturn")
      ? "ExpressTURN relay"
      : candidateType === "relay"
        ? "TURN relay"
        : "Google STUN / direct";

  return {
    usageBytes: bytesSent + bytesReceived,
    iceRoute: `${candidateType}/${protocol} -> ${remoteAddress}${remotePort ? `:${remotePort}` : ""}`,
    trafficRouteLabel: routeLabel,
  };
}

export function destroyVoicePeerConnection(peerRef: PeerRefLike) {
  if (!peerRef.current) {
    return;
  }

  peerRef.current.onicecandidate = null;
  peerRef.current.ontrack = null;
  peerRef.current.onconnectionstatechange = null;
  peerRef.current.oniceconnectionstatechange = null;
  peerRef.current.onicegatheringstatechange = null;
  peerRef.current.close();
  peerRef.current = null;
}

export function resetVoiceConnectionStats(
  setUsageBytes: (value: number) => void,
  setIceRoute: (value: string) => void,
  setTrafficRouteLabel: (value: string) => void,
) {
  setUsageBytes(0);
  setIceRoute(INITIAL_ICE_ROUTE);
  setTrafficRouteLabel(INITIAL_TRAFFIC_ROUTE_LABEL);
}

export async function collectVoicePeerDiagnostics(
  pc: RTCPeerConnection | null,
  iceRoute: string,
  trafficRouteLabel: string,
  relayOnly: boolean,
): Promise<VoicePeerDiagnostics> {
  if (!pc) {
    return {
      iceRoute,
      trafficRouteLabel,
      relayOnly,
    };
  }

  const diagnostics: VoicePeerDiagnostics = {
    connectionState: pc.connectionState,
    iceConnectionState: pc.iceConnectionState,
    iceGatheringState: pc.iceGatheringState,
    signalingState: pc.signalingState,
    iceRoute,
    trafficRouteLabel,
    relayOnly,
  };

  try {
    const stats = await pc.getStats();
    let selectedPair: RTCStats | null = null;

    stats.forEach((report) => {
      if (report.type === "transport" && "selectedCandidatePairId" in report && report.selectedCandidatePairId) {
        selectedPair = stats.get(report.selectedCandidatePairId) ?? selectedPair;
      }

      if (
        report.type === "candidate-pair" &&
        (("selected" in report && report.selected) ||
          ("nominated" in report && report.nominated && report.state === "succeeded"))
      ) {
        selectedPair = report;
      }
    });

    if (!selectedPair || !("localCandidateId" in selectedPair) || !("remoteCandidateId" in selectedPair)) {
      return diagnostics;
    }

    const local = stats.get(selectedPair.localCandidateId);
    const remote = stats.get(selectedPair.remoteCandidateId);

    diagnostics.selectedCandidateType =
      ("candidateType" in selectedPair ? selectedPair.candidateType : undefined) || undefined;
    diagnostics.selectedProtocol = ("protocol" in selectedPair ? selectedPair.protocol : undefined) || undefined;
    diagnostics.localCandidateType = (local && "candidateType" in local ? local.candidateType : undefined) || undefined;
    diagnostics.localCandidateAddress =
      (local && "address" in local ? local.address : undefined) ||
      (local && "ip" in local ? local.ip : undefined) ||
      undefined;
    diagnostics.remoteCandidateType =
      (remote && "candidateType" in remote ? remote.candidateType : undefined) || undefined;
    diagnostics.remoteCandidateAddress =
      (remote && "address" in remote ? remote.address : undefined) ||
      (remote && "ip" in remote ? remote.ip : undefined) ||
      undefined;
    diagnostics.remoteCandidatePort = (remote && "port" in remote ? remote.port : undefined) || undefined;
  } catch (error) {
    console.error("Failed to inspect selected ICE candidates:", error);
  }

  return diagnostics;
}
