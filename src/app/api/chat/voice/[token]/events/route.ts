import { NextRequest, NextResponse } from "next/server";
import { getVoiceInviteByToken } from "@/lib/voice-store";
import { appendVoiceLog } from "@/lib/voice-log";

type RouteContext = { params: Promise<{ token: string }> };

export async function POST(req: NextRequest, context: RouteContext) {
  try {
    const { token } = await context.params;
    const invite = await getVoiceInviteByToken(token);

    if (!invite) {
      return NextResponse.json({ error: "Invite unavailable" }, { status: 404 });
    }

    const body = await req.json().catch(() => ({}));
    const role = body?.role === "admin" ? "admin" : body?.role === "visitor" ? "visitor" : "system";
    const eventType = typeof body?.eventType === "string" ? body.eventType : "client-event";
    const message = typeof body?.message === "string" ? body.message : "Client voice event";

    await appendVoiceLog({
      token,
      sessionId: invite.sessionId,
      role,
      eventType,
      message,
      details: body?.details ?? null,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Create voice client event error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
