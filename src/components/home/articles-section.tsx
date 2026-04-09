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
      className="py-24 sm:py-32 bg-[linear-gradient(180deg,_#ffffff_0%,_#f8f4ec_100%)]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="max-w-3xl mb-16">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-sage-light/20 text-sage-dark text-xs font-semibold uppercase tracking-wider rounded-full mb-4">
              <BookOpen className="w-4 h-4" />
              Статьи
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-forest mb-4">
              Материалы по психологии и научным исследованиям
            </h2>
            <p className="text-forest/55 leading-relaxed">
              Подобрали несколько материалов, которые помогают лучше понять
              влияние наследуемости, среды и особенностей мышления на
              психологическое состояние человека.
            </p>
          </div>
        </FadeIn>

        <div className="grid xl:grid-cols-2 gap-8">
          {articles.map((article, index) => (
            <FadeIn key={article.title} delay={index * 140}>
              <article className="h-full rounded-[2rem] border border-sage-light/20 bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                <div className="flex items-start justify-between gap-4 mb-6">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-sage-dark/80 mb-3">
                      Обзор исследований
                    </p>
                    <h3 className="text-2xl font-bold text-forest leading-tight">
                      {article.title}
                    </h3>
                  </div>
                  <div className="hidden sm:flex w-14 h-14 rounded-2xl bg-gradient-to-br from-sage-light/45 to-sage/15 items-center justify-center flex-shrink-0">
                    <BookOpen className="w-7 h-7 text-sage-dark" />
                  </div>
                </div>

                <p className="text-forest/60 leading-relaxed mb-6">
                  {article.intro}
                </p>

                <ul className="space-y-4 mb-8">
                  {article.points.map((point) => (
                    <li
                      key={point}
                      className="flex items-start gap-3 text-sm leading-6 text-forest/65"
                    >
                      <Leaf className="w-4 h-4 text-sage mt-1 flex-shrink-0" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>

                <div className="rounded-2xl bg-cream p-5 border border-sage-light/20">
                  <p className="text-xs uppercase tracking-[0.25em] text-forest/35 mb-4">
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
                      <ArrowRight className="w-4 h-4 text-sage-dark transition-transform group-hover:translate-x-1" />
                    </a>
                    <a
                      href={article.researchHref}
                      target="_blank"
                      rel="noreferrer"
                      className="group inline-flex items-center justify-between gap-3 rounded-xl bg-white px-4 py-3 text-sm font-medium text-forest ring-1 ring-sage-light/20 transition hover:ring-sage/40"
                    >
                      <span>{article.researchLabel}</span>
                      <ArrowRight className="w-4 h-4 text-sage-dark transition-transform group-hover:translate-x-1" />
                    </a>
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
