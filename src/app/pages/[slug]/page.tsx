import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ContentPageDetail } from "@/components/articles/content-page-detail";
import {
  getManagedContentPages,
  getPublishedContentPageBySlug,
} from "@/lib/content";

type ContentPageRouteProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateStaticParams() {
  const pages = await getManagedContentPages();

  return pages
    .filter((page) => page.pageType === "page" && page.published)
    .map((page) => ({
      slug: page.slug,
    }));
}

export async function generateMetadata({
  params,
}: ContentPageRouteProps): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPublishedContentPageBySlug(slug, "page");

  if (!page) {
    return {
      title: "Страница не найдена | Лад",
    };
  }

  return {
    title: `${page.title} | Лад`,
    description: page.excerpt,
  };
}

export default async function ContentPageRoute({
  params,
}: ContentPageRouteProps) {
  const { slug } = await params;
  const page = await getPublishedContentPageBySlug(slug, "page");

  if (!page) {
    notFound();
  }

  return <ContentPageDetail page={page} />;
}
