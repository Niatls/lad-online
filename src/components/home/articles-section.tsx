import Link from "next/link";
import { useRef } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Leaf,
} from "lucide-react";

import type { ManagedContentPage } from "@/lib/content";

import { FadeIn } from "./fade-in";

type ArticlesSectionProps = {
  articles: ManagedContentPage[];
};

export function ArticlesSection({ articles }: ArticlesSectionProps) {
  const sliderRef = useRef<HTMLDivElement | null>(null);

  const scrollByCards = (direction: "left" | "right") => {
    const slider = sliderRef.current;
    if (!slider) {
      return;
    }

    const amount = slider.clientWidth * 0.9;
    slider.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  const handleWheelScroll = (event: React.WheelEvent<HTMLDivElement>) => {
    const slider = sliderRef.current;
    if (!slider) {
      return;
    }

    if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) {
      return;
    }

    event.preventDefault();
    slider.scrollBy({
      left: event.deltaY,
      behavior: "auto",
    });
  };

  return (
    <section
      id="articles"
      className="bg-transparent py-24 sm:py-32"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-sage-light/20 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-sage-dark">
                <BookOpen className="h-4 w-4" />
                Статьи
              </span>
              <h2 className="mb-4 text-3xl font-bold text-forest sm:text-4xl">
                Материалы по психологии и исследованиям
              </h2>
              <p className="leading-relaxed text-forest/55">
                Здесь собраны короткие обзоры и развернутые статьи, которые
                помогают спокойнее и глубже разобраться в психологических
                темах.
              </p>
            </div>

            <div className="flex items-center gap-3 self-start lg:self-auto">
              <button
                type="button"
                onClick={() => scrollByCards("left")}
                className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-sage-light/30 bg-white text-forest transition hover:border-sage/40 hover:bg-sage-light/10"
                aria-label="Прокрутить статьи влево"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => scrollByCards("right")}
                className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-sage-light/30 bg-white text-forest transition hover:border-sage/40 hover:bg-sage-light/10"
                aria-label="Прокрутить статьи вправо"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
              <Link
                href="/articles"
                className="inline-flex items-center gap-2 rounded-2xl bg-forest px-5 py-3 text-sm font-semibold text-white transition hover:bg-forest/90"
              >
                Все статьи
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </FadeIn>

        <div
          ref={sliderRef}
          onWheel={handleWheelScroll}
          className="flex snap-x snap-mandatory gap-6 overflow-x-auto pb-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {articles.map((article, index) => (
            <FadeIn
              key={article.slug}
              delay={index * 120}
              className="min-w-0 shrink-0 basis-[88%] snap-start sm:basis-[calc(50%-0.75rem)]"
            >
              <article className="flex h-full flex-col rounded-[2rem] border border-sage-light/20 bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
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
                  {article.excerpt}
                </p>

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

                <div className="mt-auto flex flex-col gap-3">
                  <Link
                    href={`/articles/${article.slug}`}
                    className="group inline-flex items-center justify-between rounded-xl bg-sage px-5 py-3 text-sm font-semibold text-white transition hover:bg-sage-dark"
                  >
                    <span>Читать полностью</span>
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>

                  {(article.sourceHref || article.researchHref) && (
                    <div className="rounded-2xl border border-sage-light/20 bg-cream p-5">
                      <p className="mb-4 text-xs uppercase tracking-[0.25em] text-forest/35">
                        Источники
                      </p>
                      <div className="flex flex-col gap-3">
                        {article.sourceHref ? (
                          <a
                            href={article.sourceHref}
                            target="_blank"
                            rel="noreferrer"
                            className="group inline-flex items-center justify-between gap-3 rounded-xl bg-white px-4 py-3 text-sm font-medium text-forest ring-1 ring-sage-light/20 transition hover:ring-sage/40"
                          >
                            <span>{article.sourceLabel || "Источник"}</span>
                            <ArrowRight className="h-4 w-4 text-sage-dark transition-transform group-hover:translate-x-1" />
                          </a>
                        ) : null}
                        {article.researchHref ? (
                          <a
                            href={article.researchHref}
                            target="_blank"
                            rel="noreferrer"
                            className="group inline-flex items-center justify-between gap-3 rounded-xl bg-white px-4 py-3 text-sm font-medium text-forest ring-1 ring-sage-light/20 transition hover:ring-sage/40"
                          >
                            <span>
                              {article.researchLabel || "Исследование"}
                            </span>
                            <ArrowRight className="h-4 w-4 text-sage-dark transition-transform group-hover:translate-x-1" />
                          </a>
                        ) : null}
                      </div>
                    </div>
                  )}
                </div>
              </article>
            </FadeIn>
          ))}
        </div>

        <div className="mt-6 flex items-center justify-center gap-3 text-sm text-forest/45 sm:hidden">
          <ArrowLeft className="h-4 w-4" />
          Свайпайте влево и вправо
          <ArrowRight className="h-4 w-4" />
        </div>
      </div>
    </section>
  );
}
