import { NextResponse } from "next/server";
import { getSessionActiveVoiceInvite } from "@/lib/voice-store";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_: Request, context: RouteContext) {
  const { id } = await context.params;
  const sessionId = Number.parseInt(id, 10);
  if (Number.isNaN(sessionId)) {
    return NextResponse.json({ error: "Invalid session id" }, { status: 400 });
  }

  try {
    const invite = await getSessionActiveVoiceInvite(sessionId);
    return NextResponse.json({ invite });
  } catch (error) {
    console.error("Get session voice invite error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
