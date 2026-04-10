"use client";

import type React from "react";
import { SquarePen } from "lucide-react";

import type { ManagedContentPage } from "@/lib/content";

import { Field, MarkdownTextareaField } from "./editor-shared";
import type { PageFormState } from "./editor-types";
import { emptyPageForm, pageToFormState } from "./editor-types";

type ContentPagesSectionProps = {
  isSavingPage: boolean;
  onDelete: () => void;
  onReset: () => void;
  onSave: () => void;
  pageForm: PageFormState;
  pages: ManagedContentPage[];
  setPageForm: React.Dispatch<React.SetStateAction<PageFormState>>;
};

export function ContentPagesSection({
  isSavingPage,
  onDelete,
  onReset,
  onSave,
  pageForm,
  pages,
  setPageForm,
}: ContentPagesSectionProps) {
  return (
    <section className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
      <div className="rounded-[2rem] border border-sage-light/30 bg-white/90 p-6 shadow-lg">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-forest">Материалы</h2>
            <p className="text-sm text-forest/55">
              Статьи и отдельные страницы
            </p>
          </div>
          <button
            type="button"
            onClick={() => setPageForm(emptyPageForm)}
            className="rounded-xl bg-cream px-3 py-2 text-sm font-semibold text-forest transition hover:bg-sage-light/20"
          >
            Новый
          </button>
        </div>

        <div className="space-y-3">
          {pages.map((page) => (
            <button
              key={`${page.slug}-${page.id ?? "fallback"}`}
              type="button"
              onClick={() => setPageForm(pageToFormState(page))}
              className="w-full rounded-xl border border-sage-light/20 bg-cream px-4 py-3 text-left transition hover:border-sage/40"
            >
              <p className="text-sm font-semibold text-forest">{page.title}</p>
              <p className="mt-1 text-xs uppercase tracking-[0.2em] text-forest/40">
                {page.pageType === "article" ? "Статья" : "Страница"} В·{" "}
                {page.slug}
              </p>
              {page.id === null ? (
                <p className="mt-1 text-xs text-forest/40">
                  Встроенный материал
                </p>
              ) : null}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-[2rem] border border-sage-light/30 bg-white/90 p-6 shadow-lg sm:p-8">
        <div className="mb-6 flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sage-light/20 text-sage-dark">
            <SquarePen className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-forest">
              {pageForm.id ? "Редактирование материала" : "Новый материал"}
            </h2>
            <p className="mt-2 text-sm text-forest/55">
              Для статей укажите тезисы и текст в Markdown. Панель над текстовыми
              полями помогает быстро вставлять заголовки, списки и акценты.
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm font-medium text-forest">Тип</span>
            <select
              value={pageForm.pageType}
              onChange={(event) =>
                setPageForm((current) => ({
                  ...current,
                  pageType: event.target.value as "article" | "page",
                }))
              }
              className="w-full rounded-xl border border-sage-light/30 bg-white px-4 py-3 text-sm text-forest outline-none transition focus:border-sage"
            >
              <option value="article">Статья</option>
              <option value="page">Страница</option>
            </select>
          </label>

          <Field
            label="Slug"
            value={pageForm.slug}
            onChange={(value) =>
              setPageForm((current) => ({ ...current, slug: value }))
            }
          />
        </div>

        <div className="mt-4 space-y-4">
          <Field
            label="Заголовок"
            value={pageForm.title}
            onChange={(value) =>
              setPageForm((current) => ({ ...current, title: value }))
            }
          />

          <MarkdownTextareaField
            label="Краткое описание"
            rows={3}
            value={pageForm.excerpt}
            onChange={(value) =>
              setPageForm((current) => ({ ...current, excerpt: value }))
            }
          />

          <MarkdownTextareaField
            label="Короткие тезисы, по одному на строку"
            rows={5}
            value={pageForm.summaryPoints}
            onChange={(value) =>
              setPageForm((current) => ({ ...current, summaryPoints: value }))
            }
          />

          <MarkdownTextareaField
            label="Полный текст"
            rows={16}
            value={pageForm.content}
            onChange={(value) =>
              setPageForm((current) => ({ ...current, content: value }))
            }
            placeholder="Можно использовать Markdown."
          />
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <Field
            label="Название источника"
            value={pageForm.sourceLabel}
            onChange={(value) =>
              setPageForm((current) => ({ ...current, sourceLabel: value }))
            }
          />
          <Field
            label="Ссылка на источник"
            value={pageForm.sourceHref}
            onChange={(value) =>
              setPageForm((current) => ({ ...current, sourceHref: value }))
            }
          />
          <Field
            label="Название исследования"
            value={pageForm.researchLabel}
            onChange={(value) =>
              setPageForm((current) => ({ ...current, researchLabel: value }))
            }
          />
          <Field
            label="Ссылка на исследование"
            value={pageForm.researchHref}
            onChange={(value) =>
              setPageForm((current) => ({ ...current, researchHref: value }))
            }
          />
        </div>

        <div className="mt-4 flex flex-wrap gap-6">
          <label className="flex items-center gap-3 text-sm text-forest">
            <input
              type="checkbox"
              checked={pageForm.published}
              onChange={(event) =>
                setPageForm((current) => ({
                  ...current,
                  published: event.target.checked,
                }))
              }
            />
            Опубликовано
          </label>

          <label className="flex items-center gap-3 text-sm text-forest">
            <input
              type="checkbox"
              checked={pageForm.showOnHomepage}
              onChange={(event) =>
                setPageForm((current) => ({
                  ...current,
                  showOnHomepage: event.target.checked,
                }))
              }
            />
            Показывать на главной
          </label>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={onSave}
            disabled={isSavingPage}
            className="rounded-xl bg-sage px-5 py-3 text-sm font-semibold text-white transition hover:bg-sage-dark disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSavingPage ? "Сохраняю..." : "Сохранить материал"}
          </button>
          <button
            type="button"
            onClick={onReset}
            className="rounded-xl bg-cream px-5 py-3 text-sm font-semibold text-forest transition hover:bg-sage-light/20"
          >
            Очистить форму
          </button>
          {pageForm.id ? (
            <button
              type="button"
              onClick={onDelete}
              className="rounded-xl bg-red-50 px-5 py-3 text-sm font-semibold text-red-700 transition hover:bg-red-100"
            >
              Удалить
            </button>
          ) : null}
        </div>
      </div>
    </section>
  );
}
