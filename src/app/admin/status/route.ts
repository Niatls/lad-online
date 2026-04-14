import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
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

  await db.$executeRaw(Prisma.sql`
    update "Application"
    set "status" = ${status},
        "updatedAt" = now()
    where "id" = ${id}
  `);

  return NextResponse.redirect(new URL("/admin", request.url));
}
