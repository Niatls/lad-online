import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { isAdminAuthenticated } from "@/lib/admin-auth";
import { createManagedContentPage } from "@/lib/content";

type ContentPayload = {
  content?: string;
  excerpt?: string;
  pageType?: "article" | "page";
  published?: boolean;
  researchHref?: string;
  researchLabel?: string;
  showOnHomepage?: boolean;
  slug?: string;
  sourceHref?: string;
  sourceLabel?: string;
  summaryPoints?: string[];
  title?: string;
};

export async function POST(request: Request) {
  const cookieStore = await cookies();

  if (!isAdminAuthenticated(cookieStore)) {
    return NextResponse.json(
      { ok: false, message: "Требуется вход в админку." },
      { status: 401 }
    );
  }

  try {
    const payload = (await request.json()) as ContentPayload;

    if (!payload.slug?.trim() || !payload.title?.trim() || !payload.content?.trim()) {
      return NextResponse.json(
        {
          ok: false,
          message: "Заполните slug, заголовок и полный текст.",
        },
        { status: 400 }
      );
    }

    await createManagedContentPage({
      slug: payload.slug.trim(),
      title: payload.title.trim(),
      excerpt: payload.excerpt?.trim() || payload.title.trim(),
      content: payload.content.trim(),
      pageType: payload.pageType === "page" ? "page" : "article",
      published: payload.published ?? true,
      showOnHomepage: payload.showOnHomepage ?? false,
      summaryPoints: payload.summaryPoints ?? [],
      sourceLabel: payload.sourceLabel,
      sourceHref: payload.sourceHref,
      researchLabel: payload.researchLabel,
      researchHref: payload.researchHref,
    });

    revalidatePath("/");
    revalidatePath("/articles");
    revalidatePath("/admin/editor");
    revalidatePath(`/articles/${payload.slug.trim()}`);
    revalidatePath(`/pages/${payload.slug.trim()}`);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to create content page", error);

    return NextResponse.json(
      { ok: false, message: "Не удалось создать материал." },
      { status: 500 }
    );
  }
}
