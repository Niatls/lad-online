import { neon } from "@neondatabase/serverless";

type ChatMessageRow = {
  id: number;
  sessionId: number;
  sender: string;
  content: string;
  createdAt: Date | string;
};

type ChatSessionRow = {
  id: number;
  visitorId: string;
  visitorName: string | null;
  status: string;
  createdAt: Date | string;
  updatedAt: Date | string;
};

type SessionSummaryRow = ChatSessionRow & {
  lastMessageId: number | null;
  lastMessageSender: string | null;
  lastMessageContent: string | null;
  lastMessageCreatedAt: Date | string | null;
  messageCount: number;
};

type UsageSummaryRow = {
  totalBytes: number | string | null;
  inviteCount: number;
};

const runtimeDatabaseUrl =
  process.env.LADSTORAGE_POSTGRES_URL ||
  process.env.LADSTORAGE_POSTGRES_PRISMA_URL ||
  process.env.LADSTORAGE_DATABASE_URL ||
  process.env.DATABASE_URL;

if (!runtimeDatabaseUrl) {
  throw new Error("Missing database URL for chat store");
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

function mapMessage(row: ChatMessageRow) {
  return {
    id: row.id,
    sessionId: row.sessionId,
    sender: row.sender,
    content: row.content,
    createdAt: new Date(row.createdAt).toISOString(),
  };
}

function mapSession(row: ChatSessionRow) {
  return {
    id: row.id,
    visitorId: row.visitorId,
    visitorName: row.visitorName,
    status: row.status,
    createdAt: new Date(row.createdAt).toISOString(),
    updatedAt: new Date(row.updatedAt).toISOString(),
  };
}

export async function getOrCreateChatSession(visitorId: string, visitorName?: string | null) {
  return withRetry(async () => {
    const existing = await sql<ChatSessionRow[]>`
      select
        id,
        "visitorId",
        "visitorName",
        status,
        "createdAt",
        "updatedAt"
      from "ChatSession"
      where "visitorId" = ${visitorId} and status = 'active'
      order by "updatedAt" desc
      limit 1
    `;

    let session = existing[0];

    if (session && visitorName?.trim() && visitorName.trim() !== session.visitorName) {
      const updated = await sql<ChatSessionRow[]>`
        update "ChatSession"
        set "visitorName" = ${visitorName.trim()}, "updatedAt" = now()
        where id = ${session.id}
        returning
          id,
          "visitorId",
          "visitorName",
          status,
          "createdAt",
          "updatedAt"
      `;
      session = updated[0];
    }

    if (!session) {
      const created = await sql<ChatSessionRow[]>`
        insert into "ChatSession" ("visitorId", "visitorName", status, "createdAt", "updatedAt")
        values (${visitorId}, ${visitorName ?? null}, 'active', now(), now())
        returning
          id,
          "visitorId",
          "visitorName",
          status,
          "createdAt",
          "updatedAt"
      `;
      session = created[0];
    }

    const messages = await sql<ChatMessageRow[]>`
      select
        id,
        "sessionId",
        sender,
        content,
        "createdAt"
      from "ChatMessage"
      where "sessionId" = ${session.id}
      order by "createdAt" asc
    `;

    return {
      ...mapSession(session),
      messages: messages.map(mapMessage),
    };
  });
}

export async function getChatMessages(sessionId: number, afterId = 0) {
  return withRetry(async () => {
    const rows = await sql<ChatMessageRow[]>`
      select
        id,
        "sessionId",
        sender,
        content,
        "createdAt"
      from "ChatMessage"
      where "sessionId" = ${sessionId} and id > ${afterId}
      order by "createdAt" asc
    `;

    return rows.map(mapMessage);
  });
}

export async function createChatMessage(sessionId: number, content: string, sender: string) {
  return withRetry(async () => {
    const session = await sql<ChatSessionRow[]>`
      select
        id,
        "visitorId",
        "visitorName",
        status,
        "createdAt",
        "updatedAt"
      from "ChatSession"
      where id = ${sessionId}
      limit 1
    `;

    if (!session[0]) {
      return null;
    }

    const inserted = await sql<ChatMessageRow[]>`
      insert into "ChatMessage" ("sessionId", sender, content, "createdAt")
      values (${sessionId}, ${sender}, ${content.trim()}, now())
      returning
        id,
        "sessionId",
        sender,
        content,
        "createdAt"
    `;

    await sql`
      update "ChatSession"
      set "updatedAt" = now()
      where id = ${sessionId}
    `;

    return mapMessage(inserted[0]);
  });
}

export async function deleteChatSession(sessionId: number) {
  return withRetry(async () => {
    const deleted = await sql<{ id: number }[]>`
      delete from "ChatSession"
      where id = ${sessionId}
      returning id
    `;

    return deleted[0] ?? null;
  });
}

export async function getAdminChatSessions() {
  return withRetry(async () => {
    const rows = await sql<SessionSummaryRow[]>`
      select
        s.id,
        s."visitorId",
        s."visitorName",
        s.status,
        s."createdAt",
        s."updatedAt",
        lm.id as "lastMessageId",
        lm.sender as "lastMessageSender",
        lm.content as "lastMessageContent",
        lm."createdAt" as "lastMessageCreatedAt",
        coalesce(mc.count, 0)::int as "messageCount"
      from "ChatSession" s
      left join lateral (
        select
          m.id,
          m.sender,
          m.content,
          m."createdAt"
        from "ChatMessage" m
        where m."sessionId" = s.id
        order by m."createdAt" desc
        limit 1
      ) lm on true
      left join (
        select "sessionId", count(*)::int as count
        from "ChatMessage"
        group by "sessionId"
      ) mc on mc."sessionId" = s.id
      order by s."updatedAt" desc
    `;

    const usageRows = await sql<UsageSummaryRow[]>`
      select
        coalesce(sum("dataUsageBytes"), 0)::bigint as "totalBytes",
        count(*)::int as "inviteCount"
      from "ChatVoiceInvite"
      where date_trunc('month', "createdAt") = date_trunc('month', now())
    `;

    return {
      sessions: rows.map((row) => ({
        ...mapSession(row),
        messages: row.lastMessageId
          ? [
              {
                id: row.lastMessageId,
                sessionId: row.id,
                sender: row.lastMessageSender ?? "visitor",
                content: row.lastMessageContent ?? "",
                createdAt: new Date(row.lastMessageCreatedAt ?? row.updatedAt).toISOString(),
              },
            ]
          : [],
        _count: { messages: row.messageCount },
      })),
      usage: {
        totalBytes: Number(usageRows[0]?.totalBytes ?? 0),
        inviteCount: usageRows[0]?.inviteCount ?? 0,
        monthlyCapBytes: 1000 * 1024 * 1024 * 1024,
      },
    };
  });
}
