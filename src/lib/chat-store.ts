import { neon } from "@neondatabase/serverless";

type ChatMessageRow = {
  id: number;
  sessionId: number;
  sender: string;
  content: string;
  replyToId: number | null;
  deletedAt: Date | string | null;
  deletedBy: string | null;
  editedAt: Date | string | null;
  createdAt: Date | string;
  replyPreviewId: number | null;
  replyPreviewSender: string | null;
  replyPreviewContent: string | null;
  replyPreviewDeletedAt: Date | string | null;
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
    replyToId: row.replyToId,
    deletedAt: row.deletedAt ? new Date(row.deletedAt).toISOString() : null,
    deletedBy: row.deletedBy,
    editedAt: row.editedAt ? new Date(row.editedAt).toISOString() : null,
    isEdited: Boolean(row.editedAt),
    isDeleted: Boolean(row.deletedAt),
    replyTo: row.replyPreviewId
      ? {
          id: row.replyPreviewId,
          sender: row.replyPreviewSender ?? "system",
          content: row.replyPreviewDeletedAt ? "Сообщение удалено" : (row.replyPreviewContent ?? ""),
          isDeleted: Boolean(row.replyPreviewDeletedAt),
        }
      : null,
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
        m.id,
        m."sessionId",
        m.sender,
        m.content,
        m."replyToId",
        m."deletedAt",
        m."deletedBy",
        m."editedAt",
        m."createdAt",
        rp.id as "replyPreviewId",
        rp.sender as "replyPreviewSender",
        rp.content as "replyPreviewContent",
        rp."deletedAt" as "replyPreviewDeletedAt"
      from "ChatMessage"
      m
      left join "ChatMessage" rp on rp.id = m."replyToId"
      where m."sessionId" = ${session.id}
      order by m."createdAt" asc
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
        m.id,
        m."sessionId",
        m.sender,
        m.content,
        m."replyToId",
        m."deletedAt",
        m."deletedBy",
        m."editedAt",
        m."createdAt",
        rp.id as "replyPreviewId",
        rp.sender as "replyPreviewSender",
        rp.content as "replyPreviewContent",
        rp."deletedAt" as "replyPreviewDeletedAt"
      from "ChatMessage" m
      left join "ChatMessage" rp on rp.id = m."replyToId"
      where m."sessionId" = ${sessionId} and m.id > ${afterId}
      order by m."createdAt" asc
    `;

    return rows.map(mapMessage);
  });
}

export async function createChatMessage(sessionId: number, content: string, sender: string, replyToId?: number | null) {
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

    if (!session[0] || session[0].status !== "active") {
      return null;
    }

    let normalizedReplyId: number | null = null;
    if (replyToId && Number.isInteger(replyToId)) {
      const replyRow = await sql<{ id: number }[]>`
        select id
        from "ChatMessage"
        where id = ${replyToId} and "sessionId" = ${sessionId}
        limit 1
      `;
      normalizedReplyId = replyRow[0]?.id ?? null;
    }

    const inserted = await sql<ChatMessageRow[]>`
      insert into "ChatMessage" ("sessionId", sender, content, "replyToId", "createdAt")
      values (${sessionId}, ${sender}, ${content.trim()}, ${normalizedReplyId}, now())
      returning
        id,
        "sessionId",
        sender,
        content,
        "replyToId",
        "deletedAt",
        "deletedBy",
        "editedAt",
        "createdAt"
    `;

    const messageId = inserted[0]?.id;
    const rows = await sql<ChatMessageRow[]>`
      select
        m.id,
        m."sessionId",
        m.sender,
        m.content,
        m."replyToId",
        m."deletedAt",
        m."deletedBy",
        m."editedAt",
        m."createdAt",
        rp.id as "replyPreviewId",
        rp.sender as "replyPreviewSender",
        rp.content as "replyPreviewContent",
        rp."deletedAt" as "replyPreviewDeletedAt"
      from "ChatMessage" m
      left join "ChatMessage" rp on rp.id = m."replyToId"
      where m.id = ${messageId}
      limit 1
    `;

    await sql`
      update "ChatSession"
      set "updatedAt" = now()
      where id = ${sessionId}
    `;

    return rows[0] ? mapMessage(rows[0]) : null;
  });
}

export async function deleteChatMessages(sessionId: number, messageIds: number[], deletedBy: string) {
  return withRetry(async () => {
    if (messageIds.length === 0) {
      return [];
    }

    const uniqueIds = [...new Set(messageIds.filter((id) => Number.isInteger(id) && id > 0))];
    if (uniqueIds.length === 0) {
      return [];
    }

    const deleted = await sql<{ id: number }[]>`
      update "ChatMessage"
      set
        content = '',
        "deletedAt" = now(),
        "deletedBy" = ${deletedBy}
      where "sessionId" = ${sessionId} and id = any(${uniqueIds}) and "deletedAt" is null
      returning id
    `;

    await sql`
      update "ChatSession"
      set "updatedAt" = now()
      where id = ${sessionId}
    `;

    return deleted.map((row) => row.id);
  });
}

export async function updateChatMessage(sessionId: number, messageId: number, sender: string, content: string) {
  return withRetry(async () => {
    const normalized = content.trim();
    if (!normalized) {
      return null;
    }

    const updated = await sql<ChatMessageRow[]>`
      update "ChatMessage"
      set
        content = ${normalized},
        "editedAt" = now()
      where
        id = ${messageId}
        and "sessionId" = ${sessionId}
        and sender = ${sender}
        and "deletedAt" is null
      returning
        id,
        "sessionId",
        sender,
        content,
        "replyToId",
        "deletedAt",
        "deletedBy",
        "editedAt",
        "createdAt"
    `;

    const row = updated[0];
    if (!row) {
      return null;
    }

    const hydrated = await sql<ChatMessageRow[]>`
      select
        m.id,
        m."sessionId",
        m.sender,
        m.content,
        m."replyToId",
        m."deletedAt",
        m."deletedBy",
        m."editedAt",
        m."createdAt",
        rp.id as "replyPreviewId",
        rp.sender as "replyPreviewSender",
        rp.content as "replyPreviewContent",
        rp."deletedAt" as "replyPreviewDeletedAt"
      from "ChatMessage" m
      left join "ChatMessage" rp on rp.id = m."replyToId"
      where m.id = ${messageId}
      limit 1
    `;

    await sql`
      update "ChatSession"
      set "updatedAt" = now()
      where id = ${sessionId}
    `;

    return hydrated[0] ? mapMessage(hydrated[0]) : null;
  });
}

export async function deleteChatSession(sessionId: number, mode: "soft" | "hard" = "hard") {
  return withRetry(async () => {
    if (mode === "soft") {
      const archived = await sql<{ id: number }[]>`
        update "ChatSession"
        set status = 'archived', "updatedAt" = now()
        where id = ${sessionId} and status <> 'archived'
        returning id
      `;

      return archived[0] ?? null;
    }

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
          case
            when m."deletedAt" is not null then 'Сообщение удалено'
            when m.content like '[[VOICE_CALL_TOKEN:%' then null
            when m.content like '[[VOICE_MESSAGE:%' then 'Голосовое сообщение'
            else m.content
          end as content,
          m."createdAt"
        from "ChatMessage" m
        where m."sessionId" = s.id
          and m.content not like '[[VOICE_CALL_TOKEN:%'
        order by m."createdAt" desc
        limit 1
      ) lm on true
      left join (
        select "sessionId", count(*)::int as count
        from "ChatMessage"
        group by "sessionId"
      ) mc on mc."sessionId" = s.id
      where s.status = 'active'
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

export async function getAdminChatSessionExport(sessionId: number) {
  return withRetry(async () => {
    const sessions = await sql`
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
    ` as ChatSessionRow[];

    const session = sessions[0];
    if (!session) {
      return null;
    }

    const messages = await sql`
      select
        m.id,
        m."sessionId",
        m.sender,
        m.content,
        m."replyToId",
        m."deletedAt",
        m."deletedBy",
        m."editedAt",
        m."createdAt",
        rp.id as "replyPreviewId",
        rp.sender as "replyPreviewSender",
        rp.content as "replyPreviewContent",
        rp."deletedAt" as "replyPreviewDeletedAt"
      from "ChatMessage" m
      left join "ChatMessage" rp on rp.id = m."replyToId"
      where m."sessionId" = ${sessionId}
      order by m."createdAt" asc
    ` as ChatMessageRow[];

    return {
      ...mapSession(session),
      messages: messages.map(mapMessage),
    };
  });
}

export async function updateVoiceTranscript(sessionId: number, messageId: number, transcript: string) {
  return withRetry(async () => {
    // 1. Fetch current message content
    const existing = await sql<ChatMessageRow[]>`
      select content from "ChatMessage"
      where id = ${messageId} and "sessionId" = ${sessionId}
      limit 1
    `;

    if (!existing[0] || !existing[0].content.startsWith('[[VOICE_MESSAGE:')) {
      return null;
    }

    // 2. Parse and update
    const contentStr = existing[0].content;
    const jsonStr = contentStr.substring('[[VOICE_MESSAGE:'.length, contentStr.length - 2);
    try {
      const metadata = JSON.parse(jsonStr);
      metadata.transcript = transcript;
      const newContent = `[[VOICE_MESSAGE:${JSON.stringify(metadata)}]]`;

      // 3. Save
      const updated = await sql<ChatMessageRow[]>`
        update "ChatMessage"
        set content = ${newContent}
        where id = ${messageId} and "sessionId" = ${sessionId}
        returning *
      `;

      return updated[0] ? mapMessage(updated[0]) : null;
    } catch (e) {
      console.error('Error updating voice transcript:', e);
      return null;
    }
  });
}
