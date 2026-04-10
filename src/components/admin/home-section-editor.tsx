"use client";

import type React from "react";

import type { HomePageContent } from "@/lib/content";
import type { HomePageSection } from "@/lib/home-sections";

import { Field, MarkdownTextareaField } from "./editor-shared";

type HomeSectionEditorProps = {
  homeForm: HomePageContent;
  section: HomePageSection | null;
  setHomeField: <K extends keyof HomePageContent>(
    key: K,
    value: HomePageContent[K]
  ) => void;
  updateSection: (
    id: string,
    updater: (section: HomePageSection) => HomePageSection
  ) => void;
};

export function HomeSectionEditor({
  homeForm,
  section,
  setHomeField,
  updateSection,
}: HomeSectionEditorProps) {
  if (!section) {
    return (
      <div className="rounded-[1.5rem] border border-sage-light/20 bg-white p-6">
        <p className="text-sm text-forest/55">
          Выберите секцию слева, чтобы редактировать ее содержимое.
        </p>
      </div>
    );
  }

  if (section.kind === "hero") {
    return (
      <SectionCard
        title="Первый экран"
        description="Главный заголовок, плашка и описание сайта."
      >
        <div className="grid gap-4 md:grid-cols-2">
          <Field
            label="Плашка"
            value={homeForm.heroBadge}
            onChange={(value) => setHomeField("heroBadge", value)}
          />
          <Field
            label="Заголовок, первая строка"
            value={homeForm.heroTitle}
            onChange={(value) => setHomeField("heroTitle", value)}
          />
          <Field
            label="Заголовок, акцент"
            value={homeForm.heroTitleAccent}
            onChange={(value) => setHomeField("heroTitleAccent", value)}
          />
        </div>
        <div className="mt-4">
          <MarkdownTextareaField
            label="Описание"
            rows={5}
            value={homeForm.heroDescription}
            onChange={(value) => setHomeField("heroDescription", value)}
          />
        </div>
      </SectionCard>
    );
  }

  if (section.kind === "about") {
    return (
      <SectionCard
        title="Блок «О нас»"
        description="Основной текст о проекте и специалистах."
      >
        <div className="space-y-4">
          <Field
            label="Заголовок"
            value={homeForm.aboutTitle}
            onChange={(value) => setHomeField("aboutTitle", value)}
          />
          <MarkdownTextareaField
            label="Первый абзац"
            rows={4}
            value={homeForm.aboutIntro}
            onChange={(value) => setHomeField("aboutIntro", value)}
          />
          <MarkdownTextareaField
            label="Второй абзац"
            rows={4}
            value={homeForm.aboutDescription}
            onChange={(value) => setHomeField("aboutDescription", value)}
          />
        </div>
      </SectionCard>
    );
  }

  if (section.kind === "booking") {
    return (
      <SectionCard
        title="Блок записи"
        description="Текст перед формой записи и заявкой."
      >
        <div className="space-y-4">
          <Field
            label="Заголовок"
            value={homeForm.bookingTitle}
            onChange={(value) => setHomeField("bookingTitle", value)}
          />
          <MarkdownTextareaField
            label="Описание"
            rows={4}
            value={homeForm.bookingDescription}
            onChange={(value) => setHomeField("bookingDescription", value)}
          />
        </div>
      </SectionCard>
    );
  }

  if (section.kind === "custom") {
    return (
      <SectionCard
        title="Своя секция"
        description="Свободный информационный блок с заголовками, текстом и кнопкой."
      >
        <div className="grid gap-4 md:grid-cols-2">
          <Field
            label="Плашка"
            value={section.badge}
            onChange={(value) =>
              updateSection(section.id, (current) => ({ ...current, badge: value }))
            }
          />
          <Field
            label="Заголовок"
            value={section.title}
            onChange={(value) =>
              updateSection(section.id, (current) => ({ ...current, title: value }))
            }
          />
        </div>

        <div className="mt-4 space-y-4">
          <Field
            label="Подзаголовок"
            value={section.subtitle}
            onChange={(value) =>
              updateSection(section.id, (current) => ({
                ...current,
                subtitle: value,
              }))
            }
          />
          <MarkdownTextareaField
            label="Текст секции"
            rows={8}
            value={section.body}
            onChange={(value) =>
              updateSection(section.id, (current) => ({ ...current, body: value }))
            }
          />
          <div className="grid gap-4 md:grid-cols-2">
            <Field
              label="Текст кнопки"
              value={section.ctaLabel}
              onChange={(value) =>
                updateSection(section.id, (current) => ({
                  ...current,
                  ctaLabel: value,
                }))
              }
            />
            <Field
              label="Куда ведет кнопка"
              value={section.ctaTarget}
              onChange={(value) =>
                updateSection(section.id, (current) => ({
                  ...current,
                  ctaTarget: value,
                }))
              }
              placeholder="booking"
            />
          </div>
          <label className="space-y-2">
            <span className="text-sm font-medium text-forest">Стиль секции</span>
            <select
              value={section.variant}
              onChange={(event) =>
                updateSection(section.id, (current) => ({
                  ...current,
                  variant: event.target.value as HomePageSection["variant"],
                }))
              }
              className="w-full rounded-xl border border-sage-light/30 bg-white px-4 py-3 text-sm text-forest outline-none transition focus:border-sage"
            >
              <option value="default">Обычная</option>
              <option value="highlight">Акцентная</option>
              <option value="quote">Цитата / темная</option>
            </select>
          </label>
        </div>
      </SectionCard>
    );
  }

  return (
    <SectionCard
      title="Шаблонная секция"
      description="Эта секция уже встроена в сайт. Здесь можно управлять ее порядком и видимостью, а само содержимое либо задается шаблоном, либо редактируется в соседних вкладках."
    >
      <p className="text-sm leading-6 text-forest/55">
        Для секции{" "}
        <span className="font-semibold text-forest">{section.title}</span>{" "}
        сейчас доступны порядок, скрытие и живой предпросмотр. Для услуг
        используйте вкладку «Навигация и услуги», а статьи, цены и процесс пока
        остаются шаблонными блоками.
      </p>
    </SectionCard>
  );
}

function SectionCard({
  children,
  description,
  title,
}: {
  children: React.ReactNode;
  description: string;
  title: string;
}) {
  return (
    <div className="rounded-[1.5rem] border border-sage-light/20 bg-white p-6">
      <h3 className="text-lg font-semibold text-forest">{title}</h3>
      <p className="mt-1 text-sm leading-6 text-forest/55">{description}</p>
      <div className="mt-5">{children}</div>
    </div>
  );
}
