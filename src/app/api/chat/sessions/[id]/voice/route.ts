import { getSessionActiveVoiceInvite } from "@/lib/voice-store";
import { getSessionActiveNativeVoiceInvite } from "@/lib/native-voice-store";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_: Request, context: RouteContext) {
  const { id } = await context.params;
  const sessionId = Number.parseInt(id, 10);
  if (Number.isNaN(sessionId)) {
    return NextResponse.json({ error: "Invalid session id" }, { status: 400 });
  }

  try {
    const [webInvite, nativeInvite] = await Promise.all([
      getSessionActiveVoiceInvite(sessionId),
      getSessionActiveNativeVoiceInvite(sessionId),
    ]);

    const invite = [webInvite, nativeInvite]
      .filter((i): i is NonNullable<typeof i> => i !== null)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0] || null;

    return NextResponse.json({ invite });
  } catch (error) {

    console.error("Get session voice invite error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
