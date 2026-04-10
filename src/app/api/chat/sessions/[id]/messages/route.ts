import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

type RouteContext = { params: Promise<{ id: string }> };

// GET /api/chat/sessions/[id]/messages — poll for messages
export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const sessionId = parseInt(id);
    if (isNaN(sessionId)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    const afterParam = req.nextUrl.searchParams.get("after");
    const afterId = afterParam ? parseInt(afterParam) : 0;

    const messages = await db.chatMessage.findMany({
      where: { sessionId, id: { gt: afterId } },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error(`[Chat API] Poll error:`, error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// POST /api/chat/sessions/[id]/messages — send a message
export async function POST(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const sessionId = parseInt(id);
    if (isNaN(sessionId)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    const body = await req.json();
    const { content, sender } = body;
    console.log(`[Chat API] Message from ${sender} in session ${sessionId}`);

    if (!content || typeof content !== "string" || !sender) {
      console.warn(`[Chat API] Invalid message payload`);
      return NextResponse.json({ error: "content and sender required" }, { status: 400 });
    }

    // Ensure session exists
    const session = await db.chatSession.findUnique({ where: { id: sessionId } });
    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const message = await db.chatMessage.create({
      data: { sessionId, content: content.trim(), sender },
    });

    // Touch session updatedAt
    await db.chatSession.update({
      where: { id: sessionId },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json(message);
  } catch (error) {
    console.error("Chat messages POST error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
