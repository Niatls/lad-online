import { db } from "@/lib/db";

import type { VkSessionState } from "./types";

export async function getVkSession(peerId: string) {
  return db.vkConversationSession.upsert({
    where: { peerId },
    update: {},
    create: { peerId },
  });
}

export async function updateVkSession(
  peerId: string,
  data: Partial<{
    state: VkSessionState;
    draftName: string | null;
    draftContact: string | null;
    preferredTime: string | null;
  }>
) {
  return db.vkConversationSession.upsert({
    where: { peerId },
    update: data,
    create: {
      peerId,
      ...data,
    },
  });
}

export async function resetVkSession(peerId: string) {
  await updateVkSession(peerId, {
    state: "idle",
    draftName: null,
    draftContact: null,
    preferredTime: null,
  });
}
