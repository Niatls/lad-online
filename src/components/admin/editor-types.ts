"use client";

import type { ManagedContentPage } from "@/lib/content";

export type PageFormState = {
  content: string;
  excerpt: string;
  id: number | null;
  pageType: "article" | "page";
  published: boolean;
  researchHref: string;
  researchLabel: string;
  showOnHomepage: boolean;
  slug: string;
  sourceHref: string;
  sourceLabel: string;
  summaryPoints: string;
  title: string;
};

export const emptyPageForm: PageFormState = {
  id: null,
  slug: "",
  title: "",
  excerpt: "",
  content: "",
  pageType: "article",
  published: true,
  showOnHomepage: true,
  summaryPoints: "",
  sourceLabel: "",
  sourceHref: "",
  researchLabel: "",
  researchHref: "",
};

export const menuTargets = [
  { value: "about", label: "О нас" },
  { value: "process", label: "Как это работает" },
  { value: "services", label: "Услуги" },
  { value: "articles", label: "Статьи" },
  { value: "pricing", label: "Цены" },
  { value: "contacts", label: "Контакты" },
  { value: "booking", label: "Запись" },
] as const;

export function pageToFormState(page: ManagedContentPage): PageFormState {
  return {
    id: page.id,
    slug: page.slug,
    title: page.title,
    excerpt: page.excerpt,
    content: page.content,
    pageType: page.pageType,
    published: page.published,
    showOnHomepage: page.showOnHomepage,
    summaryPoints: page.summaryPoints.join("\n"),
    sourceLabel: page.sourceLabel,
    sourceHref: page.sourceHref,
    researchLabel: page.researchLabel,
    researchHref: page.researchHref,
  };
}
