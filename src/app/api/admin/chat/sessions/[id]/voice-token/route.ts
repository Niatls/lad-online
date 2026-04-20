import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { createVoiceInvite } from "@/lib/voice-store";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(_: Request, context: RouteContext) {
  const cookieStore = await cookies();
  if (!isAdminAuthenticated(cookieStore)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const sessionId = Number.parseInt(id, 10);

  if (Number.isNaN(sessionId)) {
    return NextResponse.json({ error: "Invalid session id" }, { status: 400 });
  }

  try {
    let source: string | undefined;
    try {
      const body = await _.json();
      source = body.source;
    } catch {
      // Body may be empty
    }

    const invite = await createVoiceInvite(sessionId, { source });
    if (!invite) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    return NextResponse.json(invite);

  } catch (error) {
    console.error("Create voice invite error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
