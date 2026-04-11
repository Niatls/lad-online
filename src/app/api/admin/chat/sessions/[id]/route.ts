import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { deleteChatSession } from "@/lib/chat-store";

type RouteContext = { params: Promise<{ id: string }> };

export async function DELETE(req: Request, context: RouteContext) {
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
    const body = await req.json().catch(() => ({}));
    const mode = body?.mode === "soft" ? "soft" : "hard";
    const deleted = await deleteChatSession(sessionId, mode);
    if (!deleted) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true, mode });
  } catch (error) {
    console.error("Delete chat session error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
