import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";

import { buildAvailableBookingTimes } from "@/lib/booking-availability";
import { db } from "@/lib/db";

type PreferredTimeRow = {
  preferredTime: string | null;
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date")?.trim() ?? "";

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json(
      {
        ok: false,
        message: "Invalid booking date.",
      },
      { status: 400 }
    );
  }

  try {
    const rows = await db.$queryRaw<PreferredTimeRow[]>(Prisma.sql`
      select "preferredTime"
      from "Application"
      where "preferredTime" like ${`${date}T%`}
        and coalesce("status", 'new') <> 'archived'
    `);

    const preferredTimes = rows
      .map((row) => row.preferredTime)
      .filter((value): value is string => Boolean(value));

    return NextResponse.json({
      ok: true,
      availableTimes: buildAvailableBookingTimes(date, preferredTimes),
    });
  } catch (error) {
    console.error("Failed to load booking availability", error);

    return NextResponse.json(
      {
        ok: false,
        message: "Failed to load booking availability.",
      },
      { status: 500 }
    );
  }
}
