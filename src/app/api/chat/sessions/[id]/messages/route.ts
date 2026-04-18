import { NextRequest, NextResponse } from "next/server";

import {
  createChatMessage,
  deleteChatMessages,
  getChatMessages,
  updateChatMessage,
} from "@/lib/chat-store";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const sessionId = Number.parseInt(id, 10);
    if (Number.isNaN(sessionId)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    const afterParam = req.nextUrl.searchParams.get("after");
    const afterId = afterParam ? Number.parseInt(afterParam, 10) : 0;
    const messages = await getChatMessages(sessionId, afterId);

    return NextResponse.json(messages);
  } catch (error) {
    console.error("[Chat API] Poll error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const sessionId = Number.parseInt(id, 10);
    if (Number.isNaN(sessionId)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    const body = await req.json();
    const { content, sender, replyToId } = body;

    if (!content || typeof content !== "string" || !sender) {
      return NextResponse.json(
        { error: "content and sender required" },
        { status: 400 },
      );
    }

    const message = await createChatMessage(
      sessionId,
      content,
      sender,
      typeof replyToId === "number" ? replyToId : null,
    );
    if (!message) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    return NextResponse.json(message);
  } catch (error) {
    console.error("Chat messages POST error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const sessionId = Number.parseInt(id, 10);
    if (Number.isNaN(sessionId)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    const body = await req.json();
    const { messageId, content, sender } = body;

    if (
      typeof messageId !== "number" ||
      !content ||
      typeof content !== "string" ||
      !sender
    ) {
      return NextResponse.json(
        { error: "messageId, content and sender required" },
        { status: 400 },
      );
    }

    const message = await updateChatMessage(sessionId, messageId, sender, content);
    if (!message) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    return NextResponse.json(message);
  } catch (error) {
    console.error("Chat messages PATCH error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const sessionId = Number.parseInt(id, 10);
    if (Number.isNaN(sessionId)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    const body = await req.json();
    const { messageId, sender } = body;

    if (typeof messageId !== "number" || !sender || typeof sender !== "string") {
      return NextResponse.json(
        { error: "messageId and sender required" },
        { status: 400 },
      );
    }

    const deletedIds = await deleteChatMessages(sessionId, [messageId], sender);
    if (deletedIds.length === 0) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    return NextResponse.json({ deletedIds });
  } catch (error) {
    console.error("Chat messages DELETE error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
