import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { isAdminAuthenticated } from "@/lib/admin-auth";
import {
  getChatMessagePreviewText,
  parseVoiceMessageContent,
} from "@/lib/chat-message-format";
import { getAdminChatSessionExport } from "@/lib/chat-store";

type RouteContext = { params: Promise<{ id: string }> };

type ExportMessage = {
  id: number;
  sender: string;
  content: string;
  isDeleted: boolean;
  isEdited: boolean;
  deletedBy: string | null;
  replyTo: {
    id: number;
    sender: string;
    content: string;
    isDeleted: boolean;
  } | null;
  createdAt: string;
};

type ExportVoiceFile = {
  messageId: number;
  url: string;
  filename: string;
  mimeType: string | null;
  fileSize: number | null;
  durationMs: number | null;
};

const senderLabels: Record<string, string> = {
  admin: "Администратор",
  visitor: "Посетитель",
  system: "Система",
};

const EXT_BY_TYPE: Record<string, string> = {
  "audio/aac": "aac",
  "audio/mp4": "m4a",
  "audio/mpeg": "mp3",
  "audio/ogg": "ogg",
  "audio/webm": "webm",
  "video/mp4": "m4a",
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("ru-RU", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Europe/Moscow",
  }).format(new Date(value));
}

function formatMessage(message: ExportMessage) {
  const sender = senderLabels[message.sender] ?? message.sender;
  const voiceMessage = parseVoiceMessageContent(message.content);
  const flags = [
    message.isEdited ? "изменено" : null,
    message.isDeleted ? `удалено${message.deletedBy ? `: ${message.deletedBy}` : ""}` : null,
  ].filter(Boolean);
  const status = flags.length ? ` (${flags.join(", ")})` : "";
  const reply = message.replyTo
    ? `\n  Ответ на #${message.replyTo.id} (${senderLabels[message.replyTo.sender] ?? message.replyTo.sender}): ${
        message.replyTo.isDeleted
          ? "Сообщение удалено"
          : getChatMessagePreviewText(message.replyTo.content) ?? "Системное сообщение"
      }`
    : "";
  const content = message.isDeleted
    ? "Сообщение удалено"
    : voiceMessage
      ? [
          "Голосовое сообщение",
          voiceMessage.transcript ? `Расшифровка: ${voiceMessage.transcript}` : null,
        ]
          .filter(Boolean)
          .join("\n")
      : getChatMessagePreviewText(message.content) ?? "Системное сообщение";

  return `[${formatDate(message.createdAt)}] #${message.id} ${sender}${status}${reply}\n${content}`;
}

function buildExportText(session: NonNullable<Awaited<ReturnType<typeof getAdminChatSessionExport>>>) {
  const title = session.visitorName || `Посетитель #${session.id}`;
  const header = [
    `Диалог: ${title}`,
    `ID диалога: ${session.id}`,
    `ID посетителя: ${session.visitorId}`,
    `Статус: ${session.status}`,
    `Создан: ${formatDate(session.createdAt)}`,
    `Обновлен: ${formatDate(session.updatedAt)}`,
    `Сообщений: ${session.messages.length}`,
  ];

  return `${header.join("\n")}\n\n${session.messages.map(formatMessage).join("\n\n")}\n`;
}

function buildFilename(sessionId: number) {
  const date = new Date().toISOString().slice(0, 10);
  return `chat-dialog-${sessionId}-${date}.txt`;
}

function buildArchiveFilename(sessionId: number) {
  const date = new Date().toISOString().slice(0, 10);
  return `chat-dialog-${sessionId}-${date}.zip`;
}

function getVoiceExtension(mimeType?: string | null, url?: string | null) {
  const normalizedMime = mimeType?.split(";")[0]?.trim().toLowerCase();
  if (normalizedMime && EXT_BY_TYPE[normalizedMime]) {
    return EXT_BY_TYPE[normalizedMime];
  }

  const path = url?.split("?")[0] ?? "";
  const extension = path.match(/\.([a-z0-9]{2,5})$/i)?.[1]?.toLowerCase();
  return extension || "webm";
}

function buildVoiceFiles(messages: ExportMessage[]) {
  return messages.reduce<ExportVoiceFile[]>((files, message) => {
    if (message.isDeleted) {
      return files;
    }

    const voiceMessage = parseVoiceMessageContent(message.content);
    if (!voiceMessage) {
      return files;
    }

    const index = files.length + 1;
    const extension = getVoiceExtension(voiceMessage.mimeType, voiceMessage.url);
    files.push({
      messageId: message.id,
      url: voiceMessage.url,
      filename: `voice/${String(index).padStart(2, "0")}-message-${message.id}.${extension}`,
      mimeType: voiceMessage.mimeType,
      fileSize: voiceMessage.fileSize,
      durationMs: voiceMessage.durationMs,
    });

    return files;
  }, []);
}

export async function GET(_req: Request, context: RouteContext) {
  const cookieStore = await cookies();
  if (!isAdminAuthenticated(cookieStore)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const requestUrl = new URL(_req.url);
  const sessionId = Number.parseInt(id, 10);
  if (Number.isNaN(sessionId)) {
    return NextResponse.json({ error: "Invalid session id" }, { status: 400 });
  }

  try {
    const session = await getAdminChatSessionExport(sessionId);
    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const text = buildExportText(session);
    const voiceFiles = buildVoiceFiles(session.messages);

    if (requestUrl.searchParams.get("format") === "json") {
      return NextResponse.json({
        filename: buildArchiveFilename(session.id),
        textFilename: buildFilename(session.id),
        text,
        voiceFiles,
      });
    }

    const filename = buildFilename(session.id);
    return new Response(text, {
      headers: {
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Type": "text/plain; charset=utf-8",
      },
    });
  } catch (error) {
    console.error("Download chat session error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
