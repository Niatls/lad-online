import type { Metadata } from "next";

import { ArticlesIndexPage } from "@/components/articles/articles-index-page";
import { articles } from "@/components/home/home-data";

export const metadata: Metadata = {
  title: "Статьи | Лад",
  description:
    "Подборка статей по психологии, исследованиям и наблюдениям, собранная для проекта Лад.",
};

export default function ArticlesPage() {
  return <ArticlesIndexPage articles={articles} />;
}
