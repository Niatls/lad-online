import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { deleteChatMessages } from "@/lib/chat-store";

type RouteContext = { params: Promise<{ id: string }> };

export async function DELETE(req: NextRequest, context: RouteContext) {
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
    const messageIds = Array.isArray(body?.messageIds)
      ? body.messageIds.filter((value: unknown): value is number => typeof value === "number")
      : [];

    const deletedIds = await deleteChatMessages(sessionId, messageIds, "admin");
    return NextResponse.json({ ok: true, deletedIds });
  } catch (error) {
    console.error("Delete chat messages error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

