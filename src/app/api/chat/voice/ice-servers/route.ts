import { NextResponse } from "next/server";

type IceServer = {
  urls: string | string[];
  username?: string;
  credential?: string;
};

function buildExpressTurnServers(): IceServer[] {
  const server = process.env.EXPRESSTURN_SERVER?.trim();
  const username = process.env.EXPRESSTURN_USERNAME?.trim();
  const credential = process.env.EXPRESSTURN_CREDENTIAL?.trim();
  const googleStun =
    process.env.NEXT_PUBLIC_GOOGLE_STUN?.trim() || "stun:stun.l.google.com:19302";

  if (!server || !username || !credential) {
    return [];
  }

  const turnHost = server.replace(/^(turns?:|stuns?:)/, "");

  return [
    { urls: googleStun },
    {
      urls: [
        `turn:${turnHost}?transport=udp`,
        `turn:${turnHost}?transport=tcp`,
      ],
      username,
      credential,
    },
  ];
}

function parseStaticIceServers(): IceServer[] {
  const expressTurnServers = buildExpressTurnServers();
  if (expressTurnServers.length > 0) {
    return expressTurnServers;
  }

  const urls = process.env.TURN_URLS?.split(",")
    .map((value) => value.trim())
    .filter(Boolean);

  if (!urls?.length) {
    return [];
  }

  return [
    {
      urls,
      username: process.env.TURN_USERNAME,
      credential: process.env.TURN_CREDENTIAL,
    },
  ];
}

function getFallbackIceServers(): IceServer[] {
  return [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:openrelay.metered.ca:80" },
    {
      urls: "turn:openrelay.metered.ca:80",
      username: "openrelayproject",
      credential: "openrelayproject",
    },
    {
      urls: "turn:openrelay.metered.ca:443",
      username: "openrelayproject",
      credential: "openrelayproject",
    },
    {
      urls: "turn:openrelay.metered.ca:443?transport=tcp",
      username: "openrelayproject",
      credential: "openrelayproject",
    },
  ];
}

async function fetchMeteredIceServers(): Promise<IceServer[] | null> {
  const appName = process.env.METERED_TURN_APP_NAME?.trim();
  const apiKey = process.env.METERED_TURN_API_KEY?.trim();

  if (!appName || !apiKey) {
    return null;
  }

  const endpoint = `https://${appName}.metered.live/api/v1/turn/credentials?apiKey=${encodeURIComponent(apiKey)}`;
  const response = await fetch(endpoint, { cache: "no-store" });

  if (!response.ok) {
    throw new Error(`Metered credentials request failed with ${response.status}`);
  }

  const iceServers = (await response.json()) as IceServer[];
  return iceServers;
}

export async function GET() {
  try {
    const meteredIceServers = await fetchMeteredIceServers().catch((error) => {
      console.warn("Metered ICE fetch failed, using fallback:", error);
      return null;
    });

    const staticIceServers = parseStaticIceServers();
    const iceServers =
      meteredIceServers && meteredIceServers.length > 0
        ? meteredIceServers
        : staticIceServers.length > 0
          ? staticIceServers
          : getFallbackIceServers();

    return NextResponse.json({ iceServers });
  } catch (error) {
    console.error("ICE server config error:", error);
    return NextResponse.json({ iceServers: getFallbackIceServers() });
  }
}
