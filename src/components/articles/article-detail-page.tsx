import Link from "next/link";
import { ArrowLeft, ArrowRight, BookOpen, Leaf } from "lucide-react";

import type { Article } from "@/components/home/home-data";

type ArticleDetailPageProps = {
  article: Article;
};

export function ArticleDetailPage({ article }: ArticleDetailPageProps) {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,_#f8f4ec_0%,_#ffffff_28%,_#f7f1e6_100%)]">
      <section className="relative overflow-hidden pb-20 pt-16 sm:pb-24 sm:pt-24">
        <div className="absolute inset-0">
          <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-sage-light/20 blur-3xl" />
          <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-cream-dark/30 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <Link
            href="/articles"
            className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-forest/65 transition hover:text-forest"
          >
            <ArrowLeft className="h-4 w-4" />
            Вернуться к статьям
          </Link>

          <div className="rounded-[2rem] border border-sage-light/20 bg-white/90 p-8 shadow-xl backdrop-blur sm:p-12">
            <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-sage-light/45 to-sage/15">
              <BookOpen className="h-7 w-7 text-sage-dark" />
            </div>

            <p className="mb-4 text-xs uppercase tracking-[0.3em] text-sage-dark/80">
              Полная статья
            </p>
            <h1 className="mb-6 text-4xl font-bold leading-tight text-forest sm:text-5xl">
              {article.title}
            </h1>
            <p className="max-w-3xl text-lg leading-8 text-forest/65">
              {article.intro}
            </p>
          </div>
        </div>
      </section>

      <section className="pb-24">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:px-8">
          <div className="space-y-8">
            {article.sections.map((section) => (
              <article
                key={section.heading}
                className="rounded-[2rem] border border-sage-light/20 bg-white p-8 shadow-sm sm:p-10"
              >
                <h2 className="mb-5 text-2xl font-bold text-forest">
                  {section.heading}
                </h2>

                <div className="space-y-4">
                  {section.paragraphs.map((paragraph) => (
                    <p
                      key={paragraph}
                      className="leading-8 text-[15px] text-forest/70 sm:text-base"
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>

                {section.points ? (
                  <ul className="mt-6 space-y-4">
                    {section.points.map((point) => (
                      <li
                        key={point}
                        className="flex items-start gap-3 text-sm leading-7 text-forest/65"
                      >
                        <Leaf className="mt-1 h-4 w-4 flex-shrink-0 text-sage" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </article>
            ))}
          </div>

          <aside className="space-y-6 lg:sticky lg:top-8 lg:self-start">
            <div className="rounded-[2rem] border border-sage-light/20 bg-white p-7 shadow-sm">
              <p className="mb-4 text-xs uppercase tracking-[0.25em] text-forest/35">
                Коротко
              </p>
              <ul className="space-y-4">
                {article.points.map((point) => (
                  <li
                    key={point}
                    className="flex items-start gap-3 text-sm leading-6 text-forest/65"
                  >
                    <Leaf className="mt-1 h-4 w-4 flex-shrink-0 text-sage" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-[2rem] border border-sage-light/20 bg-cream p-7 shadow-sm">
              <p className="mb-4 text-xs uppercase tracking-[0.25em] text-forest/35">
                Источники
              </p>
              <div className="flex flex-col gap-3">
                <a
                  href={article.sourceHref}
                  target="_blank"
                  rel="noreferrer"
                  className="group inline-flex items-center justify-between gap-3 rounded-xl bg-white px-4 py-3 text-sm font-medium text-forest ring-1 ring-sage-light/20 transition hover:ring-sage/40"
                >
                  <span>{article.sourceLabel}</span>
                  <ArrowRight className="h-4 w-4 text-sage-dark transition-transform group-hover:translate-x-1" />
                </a>
                <a
                  href={article.researchHref}
                  target="_blank"
                  rel="noreferrer"
                  className="group inline-flex items-center justify-between gap-3 rounded-xl bg-white px-4 py-3 text-sm font-medium text-forest ring-1 ring-sage-light/20 transition hover:ring-sage/40"
                >
                  <span>{article.researchLabel}</span>
                  <ArrowRight className="h-4 w-4 text-sage-dark transition-transform group-hover:translate-x-1" />
                </a>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
