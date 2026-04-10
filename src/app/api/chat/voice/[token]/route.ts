import { NextRequest, NextResponse } from "next/server";
import { activateVoiceInvite, endVoiceInvite, getVoiceInviteByToken } from "@/lib/voice-store";

type RouteContext = { params: Promise<{ token: string }> };

export async function GET(_: NextRequest, context: RouteContext) {
  try {
    const { token } = await context.params;
    const invite = await getVoiceInviteByToken(token);

    if (!invite) {
      return NextResponse.json({ error: "Invite not found" }, { status: 404 });
    }

    if (["expired", "ended"].includes(invite.status)) {
      return NextResponse.json({ error: "Invite unavailable", invite }, { status: 410 });
    }

    return NextResponse.json(invite);
  } catch (error) {
    console.error("Get voice invite error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest, context: RouteContext) {
  try {
    const { token } = await context.params;
    const body = await req.json().catch(() => ({}));
    const action = typeof body?.action === "string" ? body.action : "join";

    if (action === "end") {
      const invite = await endVoiceInvite(token);
      if (!invite) {
        return NextResponse.json({ error: "Invite unavailable" }, { status: 404 });
      }
      return NextResponse.json(invite);
    }

    const invite = await activateVoiceInvite(token);
    if (!invite) {
      return NextResponse.json({ error: "Invite unavailable" }, { status: 404 });
    }

    return NextResponse.json(invite);
  } catch (error) {
    console.error("Update voice invite error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
