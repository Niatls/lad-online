import { NextRequest, NextResponse } from "next/server";
import { createVoiceSignal, getVoiceSignals } from "@/lib/voice-store";

type RouteContext = { params: Promise<{ token: string }> };

function isValidRole(role: string) {
  return role === "admin" || role === "visitor";
}

export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const { token } = await context.params;
    const after = Number.parseInt(req.nextUrl.searchParams.get("after") ?? "0", 10);
    const role = req.nextUrl.searchParams.get("role") ?? "";

    if (Number.isNaN(after) || !isValidRole(role)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const signals = await getVoiceSignals(token, after, role);
    return NextResponse.json(signals);
  } catch (error) {
    console.error("Get voice signals error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest, context: RouteContext) {
  try {
    const { token } = await context.params;
    const body = await req.json();
    const role = typeof body?.role === "string" ? body.role : "";
    const signalType = typeof body?.signalType === "string" ? body.signalType : "";

    if (!isValidRole(role) || !signalType) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const signal = await createVoiceSignal(token, role, signalType, body?.payload ?? null);
    if (!signal) {
      return NextResponse.json({ error: "Invite unavailable" }, { status: 404 });
    }

    return NextResponse.json(signal);
  } catch (error) {
    console.error("Create voice signal error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
