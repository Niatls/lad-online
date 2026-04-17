import nacl from "tweetnacl";

import { DISCORD_PUBLIC_KEY } from "./config";

function toBuffer(value: string) {
  return Buffer.from(value, "utf8");
}

function fromHex(value: string) {
  return Buffer.from(value, "hex");
}

export function verifyDiscordRequest(
  body: string,
  signature: string | null,
  timestamp: string | null
) {
  if (!DISCORD_PUBLIC_KEY || !signature || !timestamp) {
    return false;
  }

  return nacl.sign.detached.verify(
    toBuffer(timestamp + body),
    fromHex(signature),
    fromHex(DISCORD_PUBLIC_KEY)
  );
}
