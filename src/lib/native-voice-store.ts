import { randomBytes } from "node:crypto";
import { neon } from "@neondatabase/serverless";
import { buildVoiceInviteMessage } from "@/lib/chat-message-format";
import { appendVoiceLog } from "@/lib/voice-log";

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
  metadata: any | null;
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
    metadata: row.metadata,
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

function formatCallDuration(seconds: number) {
  const safeSeconds = Math.max(0, seconds);
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const remSeconds = safeSeconds % 60;
  if (hours > 0) {
    return [hours, minutes, remSeconds].map((part) => String(part).padStart(2, "0")).join(":");
  }
  return [minutes, remSeconds].map((part) => String(part).padStart(2, "0")).join(":");
}

export async function createNativeVoiceInvite(sessionId: number, metadata?: any) {
  return withRetry(async () => {
    const session = await sql<{ id: number }[]>`
      select id from "ChatSession" where id = ${sessionId} limit 1
    `;
    if (!session[0]) return null;

    await sql`
      update "NativeVoiceInvite"
      set status = 'ended', "endedAt" = coalesce("endedAt", now()), "updatedAt" = now(), "closedBy" = coalesce("closedBy", 'system_replaced')
      where "sessionId" = ${sessionId} and status in ('pending', 'active')
    `;

    const token = randomBytes(12).toString("hex");
    const inviteRows = await sql<VoiceInviteRow[]>`
      insert into "NativeVoiceInvite" ("sessionId", token, status, "dataUsageBytes", "durationSeconds", "createdAt", "updatedAt", "expiresAt", metadata)
      values (${sessionId}, ${token}, 'pending', 0, 0, now(), now(), now() + interval '5 minutes', ${JSON.stringify(metadata ?? null)}::jsonb)
      returning *
    `;

    await sql`
      insert into "ChatMessage" ("sessionId", sender, content, "createdAt")
      values (${sessionId}, 'system', ${buildVoiceInviteMessage(token, "native")}, now())
    `;

    await sql`
      insert into "ChatMessage" ("sessionId", sender, content, "createdAt")
      values (${sessionId}, 'system', 'Голосовой звонок начат (Приложение)', now())
    `;

    await sql`
      update "ChatSession" set "updatedAt" = now() where id = ${sessionId}
    `;

    await appendVoiceLog({
      token,
      sessionId,
      role: "system",
      eventType: "invite-created",
      message: "Создан новый native voice invite",
      details: { expiresInMinutes: 5 },
    });

    return mapInvite(inviteRows[0]);
  });
}

export async function getSessionActiveNativeVoiceInvite(sessionId: number) {
  return withRetry(async () => {
    const rows = await sql<VoiceInviteRow[]>`
      select * from "NativeVoiceInvite"
      where "sessionId" = ${sessionId} and status in ('pending', 'active')
      order by "createdAt" desc limit 1
    `;
    const invite = rows[0];
    if (!invite) return null;
    if (new Date(invite.expiresAt).getTime() < Date.now() && invite.status !== "expired") {
      await endNativeVoiceInvite(invite.token, {});
      return null;
    }
    return mapInvite(invite);
  });
}

export async function getNativeVoiceInviteByToken(token: string) {
  return withRetry(async () => {
    const rows = await sql<VoiceInviteRow[]>`
      select * from "NativeVoiceInvite" where token = ${token} limit 1
    `;
    const invite = rows[0];
    if (!invite) return null;
    if (new Date(invite.expiresAt).getTime() < Date.now() && invite.status !== "expired") {
      await sql`update "NativeVoiceInvite" set status = 'expired', "updatedAt" = now() where id = ${invite.id}`;
      invite.status = 'expired';
    }
    return mapInvite(invite);
  });
}

export async function activateNativeVoiceInvite(token: string, role: "admin" | "visitor" = "visitor") {
  return withRetry(async () => {
    const existingRows = await sql<VoiceInviteRow[]>`
      select * from "NativeVoiceInvite" where token = ${token} limit 1
    `;
    const existingInvite = existingRows[0];
    if (!existingInvite || ["ended", "expired"].includes(existingInvite.status)) return null;

    const rows = await sql<VoiceInviteRow[]>`
      update "NativeVoiceInvite"
      set
        status = case when status = 'pending' then 'active' else status end,
        "expiresAt" = case when status = 'pending' and ${role} = 'visitor' then now() + interval '2 hours' else "expiresAt" end,
        "joinedAt" = case when ${role} = 'visitor' and "joinedAt" is null then now() else "joinedAt" end,
        "updatedAt" = now()
      where token = ${token} and status in ('pending', 'active')
      returning *
    `;
    const invite = rows[0] ? mapInvite(rows[0]) : null;
    if (invite && (role === "admin" || (role === "visitor" && !existingInvite.joinedAt))) {
      await appendVoiceLog({
        token,
        sessionId: invite.sessionId,
        role,
        eventType: "invite-joined",
        message: role === "visitor" ? "Пользователь вошёл в звонок (Native)" : "Администратор открыл звонок (Native)",
        details: { status: invite.status },
      });
    }
    return invite;
  });
}

export async function endNativeVoiceInvite(token: string, summary: { dataUsageBytes?: number; durationSeconds?: number; closedBy?: string; }) {
  return withRetry(async () => {
    const existing = await sql<VoiceInviteRow[]>`
      select * from "NativeVoiceInvite" where token = ${token} limit 1
    `;
    const currentInvite = existing[0];
    if (!currentInvite) return null;
    if (currentInvite.status === "ended") return mapInvite(currentInvite);

    const rows = await sql<VoiceInviteRow[]>`
      update "NativeVoiceInvite"
      set
        status = 'ended',
        "endedAt" = coalesce("endedAt", now()),
        "updatedAt" = now(),
        "dataUsageBytes" = greatest("dataUsageBytes", ${summary.dataUsageBytes ?? 0}),
        "durationSeconds" = greatest("durationSeconds", ${summary.durationSeconds ?? 0}),
        "closedBy" = coalesce(${summary.closedBy ?? null}, "closedBy")
      where token = ${token} and status <> 'ended'
      returning *
    `;
    const invite = rows[0];
    if (!invite) return mapInvite(currentInvite);

    const durationSeconds = Math.max(summary.durationSeconds ?? 0, invite.durationSeconds ?? 0);
    await sql`
      insert into "ChatMessage" ("sessionId", sender, content, "createdAt")
      values (${invite.sessionId}, 'system', ${`Голосовой звонок завершён (Приложение). Длительность: ${formatCallDuration(durationSeconds)}.`}, now())
    `;
    await sql`update "ChatSession" set "updatedAt" = now() where id = ${invite.sessionId}`;
    await appendVoiceLog({
      token,
      sessionId: invite.sessionId,
      role: summary.closedBy === "admin" || summary.closedBy === "visitor" ? summary.closedBy : "system",
      eventType: "invite-ended",
      message: "Звонок завершён (Native)",
      details: { durationSeconds, dataUsageBytes: Number(invite.dataUsageBytes ?? 0), closedBy: summary.closedBy ?? invite.closedBy ?? "system" },
    });
    return mapInvite(invite);
  });
}

export async function createNativeVoiceSignal(token: string, senderRole: string, signalType: string, payload: unknown) {
  return withRetry(async () => {
    const invite = await sql<{ id: number; status: string; expiresAt: Date | string; sessionId: number }[]>`
      select id, status, "expiresAt", "sessionId" from "NativeVoiceInvite" where token = ${token} limit 1
    `;
    const row = invite[0];
    if (!row || ["ended", "expired"].includes(row.status)) return null;
    if (new Date(row.expiresAt).getTime() < Date.now()) {
      await endNativeVoiceInvite(token, {});
      return null;
    }
    const inserted = await sql<VoiceSignalRow[]>`
      insert into "NativeVoiceSignal" ("inviteId", "senderRole", "signalType", payload, "createdAt")
      values (${row.id}, ${senderRole}, ${signalType}, ${JSON.stringify(payload)}::jsonb, now())
      returning *
    `;
    const signal = mapSignal(inserted[0]);
    await appendVoiceLog({
      token,
      sessionId: row.sessionId,
      role: senderRole === "admin" || senderRole === "visitor" ? senderRole : "system",
      eventType: `native-signal-${signalType}`,
      message: `Native: Отправлен сигнал ${signalType}`,
      details: payload,
    });
    return signal;
  });
}

export async function getNativeVoiceSignals(token: string, afterId: number, viewerRole: string) {
  return withRetry(async () => {
    const invite = await sql<{ id: number; status: string }[]>`
      select id, status from "NativeVoiceInvite" where token = ${token} limit 1
    `;
    if (!invite[0] || ["ended", "expired"].includes(invite[0].status)) return [];
    const rows = await sql<VoiceSignalRow[]>`
      select * from "NativeVoiceSignal"
      where "inviteId" = ${invite[0].id} and id > ${afterId} and "senderRole" <> ${viewerRole}
      order by id asc
    `;
    return rows.map(mapSignal);
  });
}
