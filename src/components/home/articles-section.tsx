import Link from "next/link";
import { ArrowRight, BookOpen, Leaf } from "lucide-react";

import { FadeIn } from "./fade-in";
import type { Article } from "./home-data";

type ArticlesSectionProps = {
  articles: Article[];
};

export function ArticlesSection({ articles }: ArticlesSectionProps) {
  return (
    <section
      id="articles"
      className="bg-[linear-gradient(180deg,_#ffffff_0%,_#f8f4ec_100%)] py-24 sm:py-32"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="mb-16 max-w-3xl">
            <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-sage-light/20 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-sage-dark">
              <BookOpen className="h-4 w-4" />
              Статьи
            </span>
            <h2 className="mb-4 text-3xl font-bold text-forest sm:text-4xl">
              Материалы по психологии и исследованиям
            </h2>
            <p className="leading-relaxed text-forest/55">
              Здесь собраны короткие обзоры и развернутые статьи, которые
              помогают спокойнее и глубже разобраться в психологических темах.
            </p>
          </div>
        </FadeIn>

        <div className="grid gap-8 xl:grid-cols-2">
          {articles.map((article, index) => (
            <FadeIn key={article.slug} delay={index * 140}>
              <article className="h-full rounded-[2rem] border border-sage-light/20 bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                <div className="mb-6 flex items-start justify-between gap-4">
                  <div>
                    <p className="mb-3 text-xs uppercase tracking-[0.3em] text-sage-dark/80">
                      Обзор исследований
                    </p>
                    <h3 className="text-2xl font-bold leading-tight text-forest">
                      {article.title}
                    </h3>
                  </div>
                  <div className="hidden h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-sage-light/45 to-sage/15 sm:flex">
                    <BookOpen className="h-7 w-7 text-sage-dark" />
                  </div>
                </div>

                <p className="mb-6 leading-relaxed text-forest/60">
                  {article.intro}
                </p>

                <ul className="mb-8 space-y-4">
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

                <div className="flex flex-col gap-3">
                  <Link
                    href={`/articles/${article.slug}`}
                    className="group inline-flex items-center justify-between rounded-xl bg-sage px-5 py-3 text-sm font-semibold text-white transition hover:bg-sage-dark"
                  >
                    <span>Читать полностью</span>
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>

                  <div className="rounded-2xl border border-sage-light/20 bg-cream p-5">
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
                </div>
              </article>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
