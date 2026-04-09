import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { isAdminAuthenticated } from "@/lib/admin-auth";
import {
  deleteManagedContentPage,
  updateManagedContentPage,
} from "@/lib/content";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

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

export async function PUT(request: Request, context: RouteContext) {
  const cookieStore = await cookies();

  if (!isAdminAuthenticated(cookieStore)) {
    return NextResponse.json(
      { ok: false, message: "Требуется вход в админку." },
      { status: 401 }
    );
  }

  const { id } = await context.params;

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

    await updateManagedContentPage(Number(id), {
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
    console.error("Failed to update content page", error);

    return NextResponse.json(
      { ok: false, message: "Не удалось обновить материал." },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const cookieStore = await cookies();

  if (!isAdminAuthenticated(cookieStore)) {
    return NextResponse.json(
      { ok: false, message: "Требуется вход в админку." },
      { status: 401 }
    );
  }

  const { id } = await context.params;

  try {
    await deleteManagedContentPage(Number(id));

    revalidatePath("/");
    revalidatePath("/articles");
    revalidatePath("/admin/editor");

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to delete content page", error);

    return NextResponse.json(
      { ok: false, message: "Не удалось удалить материал." },
      { status: 500 }
    );
  }
}
