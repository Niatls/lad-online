import { NextResponse } from "next/server";
import { cookies, headers } from "next/headers";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import { applicationStatuses, type ApplicationStatus } from "@/lib/applications";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cookieStore = await cookies();
    const headersList = await headers();
    const authHeader = headersList.get("authorization");

    if (!isAdminAuthenticated(cookieStore, authHeader)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const json = await request.json();
    const { status } = json;

    if (!status || !(status in applicationStatuses)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const updated = await db.application.update({
      where: { id: parseInt(id) },
      data: { status },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Admin application update error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
