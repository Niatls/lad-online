import type { Metadata } from "next";

import { ArticlesIndexPage } from "@/components/articles/articles-index-page";
import { getManagedContentPages } from "@/lib/content";

export const metadata: Metadata = {
  title: "Статьи | Лад",
  description:
    "Подборка статей по психологии, исследованиям и наблюдениям, собранная для проекта Лад.",
};

export default async function ArticlesPage() {
  const pages = await getManagedContentPages();
  const articlePages = pages.filter(
    (page) => page.published && (page.pageType === "article" || page.pageType === "page")
  );

  return <ArticlesIndexPage articles={articlePages} />;
}
