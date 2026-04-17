import { NextResponse } from "next/server";

import { loadAvailableBookingTimes } from "@/lib/application-submission";

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
    return NextResponse.json({
      ok: true,
      availableTimes: await loadAvailableBookingTimes(date),
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
