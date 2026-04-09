import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ArticleDetailPage } from "@/components/articles/article-detail-page";
import { getPublishedArticles, getPublishedContentPageBySlug } from "@/lib/content";

type ArticlePageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateStaticParams() {
  const articles = await getPublishedArticles();

  return articles.map((article) => ({
    slug: article.slug,
  }));
}

export async function generateMetadata({
  params,
}: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getPublishedContentPageBySlug(slug, "article");

  if (!article) {
    return {
      title: "Статья не найдена | Лад",
    };
  }

  return {
    title: `${article.title} | Лад`,
    description: article.excerpt,
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = await getPublishedContentPageBySlug(slug, "article");

  if (!article) {
    notFound();
  }

  return <ArticleDetailPage article={article} />;
}
