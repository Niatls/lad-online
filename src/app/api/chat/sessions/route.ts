import { NextRequest, NextResponse } from "next/server";
import { getOrCreateChatSession } from "@/lib/chat-store";

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
    const session = await getOrCreateChatSession(visitorId, visitorName);

    return NextResponse.json(session);
  } catch (error) {
    console.error(`[Chat API] Session error for visitor:`, error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
