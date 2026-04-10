import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// POST /api/chat/sessions — create or get existing session
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { visitorId, visitorName } = body;
    console.log(`[Chat API] Session request for visitor: ${visitorId}`);

    if (!visitorId || typeof visitorId !== "string") {
      console.warn(`[Chat API] Missing visitorId in request`);
      return NextResponse.json({ error: "visitorId required" }, { status: 400 });
    }

    // Find existing active session or create new
    let session = await db.chatSession.findFirst({
      where: { visitorId, status: "active" },
      include: { messages: { orderBy: { createdAt: "asc" } } },
    });

    if (!session) {
      session = await db.chatSession.create({
        data: {
          visitorId,
          visitorName: visitorName || null,
        },
        include: { messages: { orderBy: { createdAt: "asc" } } },
      });
    }

    return NextResponse.json(session);
  } catch (error) {
    console.error(`[Chat API] Session error for visitor:`, error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
