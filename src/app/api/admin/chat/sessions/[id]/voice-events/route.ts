import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getVoiceEventsBySession } from "@/lib/voice-log";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(req: Request, context: RouteContext) {
  const cookieStore = await cookies();
  if (!isAdminAuthenticated(cookieStore)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const sessionId = Number.parseInt(id, 10);
  if (Number.isNaN(sessionId)) {
    return NextResponse.json({ error: "Invalid session id" }, { status: 400 });
  }

  const url = new URL(req.url);
  const limitParam = Number.parseInt(url.searchParams.get("limit") ?? "20", 10);
  const limit = Number.isNaN(limitParam) ? 20 : limitParam;

  try {
    const events = await getVoiceEventsBySession(sessionId, limit);
    return NextResponse.json({ events });
  } catch (error) {
    console.error("Admin voice events error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
