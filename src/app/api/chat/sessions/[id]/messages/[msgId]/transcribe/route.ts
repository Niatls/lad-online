import { NextRequest, NextResponse } from "next/server";
import { updateVoiceTranscript } from "@/lib/chat-store";
import { neon } from "@neondatabase/serverless";

const runtimeDatabaseUrl =
  process.env.LADSTORAGE_POSTGRES_URL ||
  process.env.LADSTORAGE_POSTGRES_PRISMA_URL ||
  process.env.LADSTORAGE_DATABASE_URL ||
  process.env.DATABASE_URL;

const sql = neon(runtimeDatabaseUrl!);

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string; msgId: string }> }
) {
  try {
    const { id, msgId } = await context.params;
    const sessionId = parseInt(id);
    const messageId = parseInt(msgId);

    // 0. Check if transcript is provided in the body (Local STT from Admin)
    const body = await req.json().catch(() => ({}));
    if (body.transcript) {
      const updatedMessage = await updateVoiceTranscript(sessionId, messageId, body.transcript);
      return NextResponse.json(updatedMessage);
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: "Missing OPENAI_API_KEY (and no transcript provided)" }, { status: 500 });
    }

    // 1. Fetch message to get audio URL
    const rows = await sql`
      select content from "ChatMessage" 
      where id = ${messageId} and "sessionId" = ${sessionId}
    `;

    if (rows.length === 0) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    const content = rows[0].content;
    if (!content.startsWith('[[VOICE_MESSAGE:')) {
      return NextResponse.json({ error: "Not a voice message" }, { status: 400 });
    }

    const jsonStr = content.substring('[[VOICE_MESSAGE:'.length, content.length - 2);
    const metadata = JSON.parse(jsonStr);
    
    // 2. Resolve audio URL (it might be relative)
    let audioUrl = metadata.url;
    if (audioUrl.startsWith('/')) {
      const baseUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000';
      audioUrl = `${baseUrl}${audioUrl}`;
    }

    // 3. Download audio
    const audioRes = await fetch(audioUrl);
    if (!audioRes.ok) {
        return NextResponse.json({ error: "Failed to download audio" }, { status: 500 });
    }
    const audioBlob = await audioRes.blob();

    // 4. Send to Whisper
    const whisperFormData = new FormData();
    // OpenAI Whisper expects a file with a name and correct extension
    const extension = metadata.mimeType?.split('/')?.[1] || 'webm';
    whisperFormData.append("file", audioBlob, `audio.${extension}`);
    whisperFormData.append("model", "whisper-1");
    whisperFormData.append("language", "ru");

    const whisperResponse = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: whisperFormData,
    });

    if (!whisperResponse.ok) {
      const errorText = await whisperResponse.text();
      return NextResponse.json({ error: `Whisper error: ${errorText}` }, { status: 500 });
    }

    const whisperData = await whisperResponse.json();
    const transcript = whisperData.text;

    if (!transcript) {
      return NextResponse.json({ error: "No transcript generated" }, { status: 500 });
    }

    // 5. Update DB
    const updatedMessage = await updateVoiceTranscript(sessionId, messageId, transcript);

    return NextResponse.json(updatedMessage);
  } catch (error) {
    console.error("Transcription error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
