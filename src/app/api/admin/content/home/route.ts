import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { isAdminAuthenticated } from "@/lib/admin-auth";
import {
  defaultHomePageContent,
  upsertHomePageContent,
  type HomePageContent,
} from "@/lib/content";

export async function POST(request: Request) {
  const cookieStore = await cookies();

  if (!isAdminAuthenticated(cookieStore)) {
    return NextResponse.json(
      { ok: false, message: "Требуется вход в админку." },
      { status: 401 }
    );
  }

  try {
    const payload = (await request.json()) as Partial<HomePageContent>;
    const content: HomePageContent = {
      heroBadge: payload.heroBadge?.trim() || defaultHomePageContent.heroBadge,
      heroTitle: payload.heroTitle?.trim() || defaultHomePageContent.heroTitle,
      heroTitleAccent:
        payload.heroTitleAccent?.trim() ||
        defaultHomePageContent.heroTitleAccent,
      heroDescription:
        payload.heroDescription?.trim() ||
        defaultHomePageContent.heroDescription,
      aboutTitle:
        payload.aboutTitle?.trim() || defaultHomePageContent.aboutTitle,
      aboutIntro:
        payload.aboutIntro?.trim() || defaultHomePageContent.aboutIntro,
      aboutDescription:
        payload.aboutDescription?.trim() ||
        defaultHomePageContent.aboutDescription,
      bookingTitle:
        payload.bookingTitle?.trim() || defaultHomePageContent.bookingTitle,
      bookingDescription:
        payload.bookingDescription?.trim() ||
        defaultHomePageContent.bookingDescription,
    };

    await upsertHomePageContent(content);

    revalidatePath("/");
    revalidatePath("/admin/editor");

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to save homepage content", error);

    return NextResponse.json(
      { ok: false, message: "Не удалось сохранить главную страницу." },
      { status: 500 }
    );
  }
}
