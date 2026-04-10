"use client";

import type React from "react";
import { SquarePen } from "lucide-react";

import { Accordion } from "@/components/ui/accordion";

import { EditorAccordionSection } from "./editor-accordion-section";
import { Field, MarkdownTextareaField, SectionShell } from "./editor-shared";
import type { PageFormState } from "./editor-types";

type PageEditorFormProps = {
  isSavingPage: boolean;
  onDelete: () => void;
  onReset: () => void;
  onSave: () => void;
  pageForm: PageFormState;
  setPageForm: React.Dispatch<React.SetStateAction<PageFormState>>;
};

export function PageEditorForm({
  isSavingPage,
  onDelete,
  onReset,
  onSave,
  pageForm,
  setPageForm,
}: PageEditorFormProps) {
  return (
    <SectionShell
      title={pageForm.id ? "Редактирование материала" : "Новый материал"}
      description="Для статей укажите тезисы и текст в Markdown. Аккордеоны помогают редактировать материал по частям, без перегруженной формы."
      icon={SquarePen}
    >
      <Accordion
        type="multiple"
        defaultValue={["basic", "content", "publish"]}
        className="space-y-4"
      >
        <EditorAccordionSection
          value="basic"
          title="Основное"
          description="Тип материала, slug, заголовок и краткое описание."
        >
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
          </div>
        </EditorAccordionSection>

        <EditorAccordionSection
          value="content"
          title="Текст и тезисы"
          description="Краткие тезисы и полный текст материала."
        >
          <div className="space-y-4">
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
        </EditorAccordionSection>

        <EditorAccordionSection
          value="links"
          title="Источники"
          description="Ссылки на первоисточник и исследование."
        >
          <div className="grid gap-4 md:grid-cols-2">
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
        </EditorAccordionSection>

        <EditorAccordionSection
          value="publish"
          title="Публикация"
          description="Настройки публикации и вывода на главную."
        >
          <div className="flex flex-wrap gap-6">
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
        </EditorAccordionSection>
      </Accordion>

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
    </SectionShell>
  );
}
