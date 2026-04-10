import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getAdminChatSessions } from "@/lib/chat-store";

// GET /api/admin/chat/sessions — list all chat sessions (admin only)
export async function GET() {
  try {
    const cookieStore = await cookies();
    if (!isAdminAuthenticated(cookieStore)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const sessions = await getAdminChatSessions();

    return NextResponse.json(sessions);
  } catch (error) {
    console.error("Admin chat sessions error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
