import { NextResponse } from "next/server";
import { cookies, headers } from "next/headers";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getAdminDashboardData } from "@/lib/admin-dashboard";
import { applicationStatuses, type ApplicationStatus } from "@/lib/applications";

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const headersList = await headers();
    const authHeader = headersList.get("authorization");

    if (!isAdminAuthenticated(cookieStore, authHeader)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    
    const filterStatus =
      status && status in applicationStatuses
        ? (status as ApplicationStatus)
        : undefined;

    const data = await getAdminDashboardData(filterStatus);

    return NextResponse.json(data);
  } catch (error) {
    console.error("Admin applications API error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
