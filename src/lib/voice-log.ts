import { neon } from "@neondatabase/serverless";

type VoiceLogRole = "admin" | "visitor" | "system";

type VoiceLogEntry = {
  token: string;
  sessionId: number;
  role?: VoiceLogRole;
  eventType: string;
  message: string;
  details?: unknown;
};

type VoiceEventRow = {
  id: number;
  inviteId: number;
  sessionId: number;
  token: string;
  role: string;
  eventType: string;
  message: string;
  details: unknown;
  createdAt: Date | string;
};

const runtimeDatabaseUrl =
  process.env.LADSTORAGE_POSTGRES_URL ||
  process.env.LADSTORAGE_POSTGRES_PRISMA_URL ||
  process.env.LADSTORAGE_DATABASE_URL ||
  process.env.DATABASE_URL;

if (!runtimeDatabaseUrl) {
  throw new Error("Missing database URL for voice log");
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

function mapVoiceEvent(row: VoiceEventRow) {
  return {
    id: row.id,
    inviteId: row.inviteId,
    sessionId: row.sessionId,
    token: row.token,
    role: row.role,
    eventType: row.eventType,
    message: row.message,
    details: row.details,
    createdAt: new Date(row.createdAt).toISOString(),
  };
}

export async function appendVoiceLog(entry: VoiceLogEntry) {
  return withRetry(async () => {
    const inviteRows = await sql<{ id: number }[]>`
      select id
      from "ChatVoiceInvite"
      where token = ${entry.token} and "sessionId" = ${entry.sessionId}
      limit 1
    `;

    const inviteId = inviteRows[0]?.id;
    if (!inviteId) {
      return null;
    }

    const inserted = await sql<VoiceEventRow[]>`
      insert into "ChatVoiceEvent" ("inviteId", "sessionId", token, role, "eventType", message, details, "createdAt")
      values (
        ${inviteId},
        ${entry.sessionId},
        ${entry.token},
        ${entry.role ?? "system"},
        ${entry.eventType},
        ${entry.message},
        ${JSON.stringify(entry.details ?? null)}::jsonb,
        now()
      )
      returning
        id,
        "inviteId",
        "sessionId",
        token,
        role,
        "eventType",
        message,
        details,
        "createdAt"
    `;

    return inserted[0] ? mapVoiceEvent(inserted[0]) : null;
  });
}

export async function getVoiceEventsBySession(sessionId: number, limit = 20) {
  return withRetry(async () => {
    const rows = await sql<VoiceEventRow[]>`
      select
        id,
        "inviteId",
        "sessionId",
        token,
        role,
        "eventType",
        message,
        details,
        "createdAt"
      from "ChatVoiceEvent"
      where "sessionId" = ${sessionId}
      order by "createdAt" desc
      limit ${Math.max(1, Math.min(limit, 100))}
    `;

    return rows.map(mapVoiceEvent);
  });
}

