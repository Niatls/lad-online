import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { applicationStatuses } from "@/lib/applications";
import { isAdminAuthenticated } from "@/lib/admin-auth";

export async function POST(request: Request) {
  const cookieStore = await cookies();

  if (!isAdminAuthenticated(cookieStore)) {
    return NextResponse.redirect(new URL("/admin?error=auth_required", request.url));
  }

  const formData = await request.formData();
  const id = Number(formData.get("id"));
  const status = formData.get("status");

  if (!Number.isInteger(id) || typeof status !== "string" || !(status in applicationStatuses)) {
    return NextResponse.redirect(new URL("/admin?error=invalid_status", request.url));
  }

  await db.application.update({
    where: { id },
    data: { status },
  });

  return NextResponse.redirect(new URL("/admin", request.url));
}
