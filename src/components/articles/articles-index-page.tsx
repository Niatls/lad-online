import Link from "next/link";
import { ArrowLeft, ArrowRight, BookOpen, Leaf } from "lucide-react";

import type { ManagedContentPage } from "@/lib/content";

type ArticlesIndexPageProps = {
  articles: ManagedContentPage[];
};

export function ArticlesIndexPage({ articles }: ArticlesIndexPageProps) {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,_#f8f4ec_0%,_#ffffff_28%,_#f7f1e6_100%)]">
      <section className="relative overflow-hidden pb-16 pt-16 sm:pb-20 sm:pt-24">
        <div className="absolute inset-0">
          <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-sage-light/20 blur-3xl" />
          <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-cream-dark/30 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <Link
            href="/#articles"
            className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-forest/65 transition hover:text-forest"
          >
            <ArrowLeft className="h-4 w-4" />
            Вернуться на главную
          </Link>

          <div className="rounded-[2rem] border border-sage-light/20 bg-white/90 p-8 shadow-xl backdrop-blur sm:p-12">
            <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-sage-light/45 to-sage/15">
              <BookOpen className="h-7 w-7 text-sage-dark" />
            </div>
            <p className="mb-4 text-xs uppercase tracking-[0.3em] text-sage-dark/80">
              Раздел статей
            </p>
            <h1 className="mb-6 text-4xl font-bold leading-tight text-forest sm:text-5xl">
              Полезные статьи и исследования
            </h1>
            <p className="max-w-3xl text-lg leading-8 text-forest/65">
              Здесь собраны материалы, которые можно читать отдельно от главной
              страницы: короткие выводы, полный текст и ссылки на исходные
              публикации.
            </p>
          </div>
        </div>
      </section>

      <section className="pb-24">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          {articles.map((article) => (
            <article
              key={article.slug}
              className="flex h-full flex-col rounded-[2rem] border border-sage-light/20 bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              <p className="mb-3 text-xs uppercase tracking-[0.25em] text-sage-dark/80">
                {article.pageType === "article" ? "Статья" : "Страница"}
              </p>
              <h2 className="mb-4 text-2xl font-bold leading-tight text-forest">
                {article.title}
              </h2>
              <p className="mb-6 leading-7 text-forest/60">{article.excerpt}</p>

              {article.summaryPoints.length ? (
                <ul className="mb-8 space-y-4">
                  {article.summaryPoints.map((point) => (
                    <li
                      key={point}
                      className="flex items-start gap-3 text-sm leading-6 text-forest/65"
                    >
                      <Leaf className="mt-1 h-4 w-4 flex-shrink-0 text-sage" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              ) : null}

              <div className="mt-auto flex flex-col gap-3">
                <Link
                  href={
                    article.pageType === "article"
                      ? `/articles/${article.slug}`
                      : `/pages/${article.slug}`
                  }
                  className="group inline-flex items-center justify-between rounded-xl bg-sage px-5 py-3 text-sm font-semibold text-white transition hover:bg-sage-dark"
                >
                  <span>Открыть</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
                {article.sourceHref ? (
                  <a
                    href={article.sourceHref}
                    target="_blank"
                    rel="noreferrer"
                    className="group inline-flex items-center justify-between rounded-xl bg-cream px-5 py-3 text-sm font-medium text-forest ring-1 ring-sage-light/20 transition hover:ring-sage/40"
                  >
                    <span>{article.sourceLabel || "Открыть источник"}</span>
                    <ArrowRight className="h-4 w-4 text-sage-dark transition-transform group-hover:translate-x-1" />
                  </a>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
