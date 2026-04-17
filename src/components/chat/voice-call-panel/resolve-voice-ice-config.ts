import type { IceServer } from "./types";

type ResolveVoiceIceConfigParams = {
  defaultIceServers: IceServer[];
  reconnecting: boolean;
};

export async function resolveVoiceIceConfig({
  defaultIceServers,
  reconnecting,
}: ResolveVoiceIceConfigParams) {
  const iceConfigRes = await fetch("/api/chat/voice/ice-servers", { cache: "no-store" }).catch(() => null);
  const iceConfigJson = iceConfigRes && iceConfigRes.ok ? await iceConfigRes.json() : null;
  const iceServers =
    Array.isArray(iceConfigJson?.iceServers) && iceConfigJson.iceServers.length > 0
      ? iceConfigJson.iceServers
      : defaultIceServers;

  const relayIceServers = iceServers.filter((server: IceServer) => {
    const urls = Array.isArray(server.urls) ? server.urls : [server.urls];
    return urls.some((url) => typeof url === "string" && /^turns?:/i.test(url));
  });

  return {
    iceServers,
    relayIceServers,
    relayOnly: reconnecting && relayIceServers.length > 0,
  };
}
