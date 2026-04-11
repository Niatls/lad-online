import { randomBytes } from "node:crypto";
import { neon } from "@neondatabase/serverless";
import { buildVoiceInviteMessage } from "@/lib/chat-message-format";

type VoiceInviteRow = {
  id: number;
  sessionId: number;
  token: string;
  status: string;
  dataUsageBytes: number | string;
  durationSeconds: number;
  closedBy: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  expiresAt: Date | string;
  joinedAt: Date | string | null;
  endedAt: Date | string | null;
};

type VoiceSignalRow = {
  id: number;
  inviteId: number;
  senderRole: string;
  signalType: string;
  payload: unknown;
  createdAt: Date | string;
};

const runtimeDatabaseUrl =
  process.env.LADSTORAGE_POSTGRES_URL ||
  process.env.LADSTORAGE_POSTGRES_PRISMA_URL ||
  process.env.LADSTORAGE_DATABASE_URL ||
  process.env.DATABASE_URL;

if (!runtimeDatabaseUrl) {
  throw new Error("Missing database URL for voice store");
}

const sql = neon(runtimeDatabaseUrl);

function isTransientDatabaseError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  return (
    message.includes("fetch failed") ||
    message.includes("Connect Timeout") ||
    message.includes("Server has closed the connection") ||
    message.includes("Timed out fetching a new connection")
  );
}

async function withRetry<T>(operation: () => Promise<T>, retries = 2): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      if (attempt === retries || !isTransientDatabaseError(error)) {
        throw error;
      }

      await new Promise((resolve) => setTimeout(resolve, 250 * (attempt + 1)));
    }
  }

  throw lastError;
}

function mapInvite(row: VoiceInviteRow) {
  return {
    id: row.id,
    sessionId: row.sessionId,
    token: row.token,
    status: row.status,
    dataUsageBytes: Number(row.dataUsageBytes ?? 0),
    durationSeconds: row.durationSeconds ?? 0,
    closedBy: row.closedBy,
    createdAt: new Date(row.createdAt).toISOString(),
    updatedAt: new Date(row.updatedAt).toISOString(),
    expiresAt: new Date(row.expiresAt).toISOString(),
    joinedAt: row.joinedAt ? new Date(row.joinedAt).toISOString() : null,
    endedAt: row.endedAt ? new Date(row.endedAt).toISOString() : null,
  };
}

function mapSignal(row: VoiceSignalRow) {
  return {
    id: row.id,
    inviteId: row.inviteId,
    senderRole: row.senderRole,
    signalType: row.signalType,
    payload: row.payload,
    createdAt: new Date(row.createdAt).toISOString(),
  };
}

export async function createVoiceInvite(sessionId: number) {
  return withRetry(async () => {
    const session = await sql<{ id: number }[]>`
      select id from "ChatSession" where id = ${sessionId} limit 1
    `;

    if (!session[0]) {
      return null;
    }

    const token = randomBytes(12).toString("hex");
    const inviteRows = await sql<VoiceInviteRow[]>`
      insert into "ChatVoiceInvite" ("sessionId", token, status, "dataUsageBytes", "durationSeconds", "createdAt", "updatedAt", "expiresAt")
      values (${sessionId}, ${token}, 'pending', 0, 0, now(), now(), now() + interval '5 minutes')
      returning
        id,
        "sessionId",
        token,
        status,
        "dataUsageBytes",
        "durationSeconds",
        "closedBy",
        "createdAt",
        "updatedAt",
        "expiresAt",
        "joinedAt",
        "endedAt"
    `;

    await sql`
      insert into "ChatMessage" ("sessionId", sender, content, "createdAt")
      values (${sessionId}, 'system', ${buildVoiceInviteMessage(token)}, now())
    `;

    await sql`
      update "ChatSession"
      set "updatedAt" = now()
      where id = ${sessionId}
    `;

    return mapInvite(inviteRows[0]);
  });
}

export async function getSessionActiveVoiceInvite(sessionId: number) {
  return withRetry(async () => {
    const rows = await sql<VoiceInviteRow[]>`
      select
        id,
        "sessionId",
        token,
        status,
        "dataUsageBytes",
        "durationSeconds",
        "closedBy",
        "createdAt",
        "updatedAt",
        "expiresAt",
        "joinedAt",
        "endedAt"
      from "ChatVoiceInvite"
      where "sessionId" = ${sessionId} and status in ('pending', 'active')
      order by "createdAt" desc
      limit 1
    `;

    const invite = rows[0];
    if (!invite) {
      return null;
    }

    if (new Date(invite.expiresAt).getTime() < Date.now() && invite.status !== "expired") {
      await endVoiceInvite(invite.token, {});
      return null;
    }

    return mapInvite(invite);
  });
}

export async function getVoiceInviteByToken(token: string) {
  return withRetry(async () => {
    const rows = await sql<VoiceInviteRow[]>`
      select
        id,
        "sessionId",
        token,
        status,
        "dataUsageBytes",
        "durationSeconds",
        "closedBy",
        "createdAt",
        "updatedAt",
        "expiresAt",
        "joinedAt",
        "endedAt"
      from "ChatVoiceInvite"
      where token = ${token}
      limit 1
    `;

    const invite = rows[0];
    if (!invite) {
      return null;
    }

    if (new Date(invite.expiresAt).getTime() < Date.now() && invite.status !== "expired") {
      await sql`
        update "ChatVoiceInvite"
        set status = 'expired', "updatedAt" = now()
        where id = ${invite.id}
      `;
      invite.status = "expired";
    }

    return mapInvite(invite);
  });
}

export async function activateVoiceInvite(token: string) {
  return withRetry(async () => {
    const rows = await sql<VoiceInviteRow[]>`
      update "ChatVoiceInvite"
      set
        status = case when status = 'pending' then 'active' else status end,
        "expiresAt" = case when status = 'pending' then now() + interval '2 hours' else "expiresAt" end,
        "joinedAt" = case when "joinedAt" is null then now() else "joinedAt" end,
        "updatedAt" = now()
      where token = ${token} and status in ('pending', 'active')
      returning
        id,
        "sessionId",
        token,
        status,
        "dataUsageBytes",
        "durationSeconds",
        "closedBy",
        "createdAt",
        "updatedAt",
        "expiresAt",
        "joinedAt",
        "endedAt"
    `;

    return rows[0] ? mapInvite(rows[0]) : null;
  });
}

export async function endVoiceInvite(
  token: string,
  summary: {
    dataUsageBytes?: number;
    durationSeconds?: number;
    closedBy?: string;
  },
) {
  return withRetry(async () => {
    const rows = await sql<VoiceInviteRow[]>`
      update "ChatVoiceInvite"
      set
        status = 'ended',
        "endedAt" = coalesce("endedAt", now()),
        "updatedAt" = now(),
        "dataUsageBytes" = greatest("dataUsageBytes", ${summary.dataUsageBytes ?? 0}),
        "durationSeconds" = greatest("durationSeconds", ${summary.durationSeconds ?? 0}),
        "closedBy" = coalesce(${summary.closedBy ?? null}, "closedBy")
      where token = ${token}
      returning
        id,
        "sessionId",
        token,
        status,
        "dataUsageBytes",
        "durationSeconds",
        "closedBy",
        "createdAt",
        "updatedAt",
        "expiresAt",
        "joinedAt",
        "endedAt"
    `;

    return rows[0] ? mapInvite(rows[0]) : null;
  });
}

export async function createVoiceSignal(
  token: string,
  senderRole: string,
  signalType: string,
  payload: unknown,
) {
  return withRetry(async () => {
    const invite = await sql<{ id: number; status: string; expiresAt: Date | string }[]>`
      select id, status, "expiresAt"
      from "ChatVoiceInvite"
      where token = ${token}
      limit 1
    `;

    const row = invite[0];
    if (!row || ["ended", "expired"].includes(row.status)) {
      return null;
    }

    if (new Date(row.expiresAt).getTime() < Date.now()) {
      await endVoiceInvite(token);
      return null;
    }

    const inserted = await sql<VoiceSignalRow[]>`
      insert into "ChatVoiceSignal" ("inviteId", "senderRole", "signalType", payload, "createdAt")
      values (${row.id}, ${senderRole}, ${signalType}, ${JSON.stringify(payload)}::jsonb, now())
      returning
        id,
        "inviteId",
        "senderRole",
        "signalType",
        payload,
        "createdAt"
    `;

    return mapSignal(inserted[0]);
  });
}

export async function getVoiceSignals(token: string, afterId: number, viewerRole: string) {
  return withRetry(async () => {
    const invite = await sql<{ id: number; status: string }[]>`
      select id, status
      from "ChatVoiceInvite"
      where token = ${token}
      limit 1
    `;

    if (!invite[0] || ["ended", "expired"].includes(invite[0].status)) {
      return [];
    }

    const rows = await sql<VoiceSignalRow[]>`
      select
        id,
        "inviteId",
        "senderRole",
        "signalType",
        payload,
        "createdAt"
      from "ChatVoiceSignal"
      where "inviteId" = ${invite[0].id} and id > ${afterId} and "senderRole" <> ${viewerRole}
      order by id asc
    `;

    return rows.map(mapSignal);
  });
}
