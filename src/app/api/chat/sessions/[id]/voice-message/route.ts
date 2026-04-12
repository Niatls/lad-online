import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { buildVoiceMessageContent } from "@/lib/chat-message-format";
import { createChatMessage } from "@/lib/chat-store";

type RouteContext = { params: Promise<{ id: string }> };

const MAX_AUDIO_BYTES = 10 * 1024 * 1024;

const EXT_BY_TYPE: Record<string, string> = {
  "audio/aac": "aac",
  "audio/mp4": "m4a",
  "audio/mpeg": "mp3",
  "audio/ogg": "ogg",
  "audio/webm": "webm",
  "video/mp4": "m4a",
};

export async function POST(req: NextRequest, context: RouteContext) {
  try {
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return NextResponse.json({ error: "Missing BLOB_READ_WRITE_TOKEN" }, { status: 500 });
    }

    const { id } = await context.params;
    const sessionId = Number.parseInt(id, 10);
    if (Number.isNaN(sessionId)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    const formData = await req.formData();
    const sender = formData.get("sender");
    const file = formData.get("file");
    const replyToIdValue = formData.get("replyToId");
    const durationMsValue = formData.get("durationMs");

    if ((sender !== "visitor" && sender !== "admin") || !(file instanceof File)) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    if (file.size <= 0 || file.size > MAX_AUDIO_BYTES) {
      return NextResponse.json({ error: "Invalid file size" }, { status: 400 });
    }

    const mimeType = file.type || "audio/webm";
    const extension = EXT_BY_TYPE[mimeType];
    if (!extension) {
      return NextResponse.json({ error: "Unsupported audio type" }, { status: 400 });
    }

    const replyToId =
      typeof replyToIdValue === "string" && replyToIdValue.trim()
        ? Number.parseInt(replyToIdValue, 10)
        : null;
    const durationMs =
      typeof durationMsValue === "string" && durationMsValue.trim()
        ? Number.parseInt(durationMsValue, 10)
        : null;
    const filename = `${Date.now()}-${sender}-${randomUUID()}.${extension}`;
    const blob = await put(`chat-voice/${sessionId}/${filename}`, file, {
      access: "private",
      addRandomSuffix: false,
      contentType: mimeType,
    });
    const playbackUrl = `/api/chat/voice-file?pathname=${encodeURIComponent(blob.pathname)}`;

    const content = buildVoiceMessageContent({
      url: playbackUrl,
      pathname: blob.pathname,
      mimeType,
      durationMs: Number.isFinite(durationMs) ? durationMs : null,
      fileSize: file.size,
    });

    const message = await createChatMessage(
      sessionId,
      content,
      sender,
      Number.isInteger(replyToId) ? replyToId : null,
    );

    if (!message) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    return NextResponse.json(message);
  } catch (error) {
    console.error("Voice message upload error:", error);
    const message = error instanceof Error ? error.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
