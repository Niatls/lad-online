"use client";

import type { HomePageContent } from "@/lib/content";

import { Accordion } from "@/components/ui/accordion";

import { EditorAccordionSection } from "./editor-accordion-section";
import { Field, MarkdownTextareaField } from "./editor-shared";

type HomeContentMainSectionsProps = {
  homeForm: HomePageContent;
  setHomeField: <K extends keyof HomePageContent>(
    key: K,
    value: HomePageContent[K]
  ) => void;
};

export function HomeContentMainSections({
  homeForm,
  setHomeField,
}: HomeContentMainSectionsProps) {
  return (
    <Accordion
      type="multiple"
      defaultValue={["hero", "about"]}
      className="space-y-4"
    >
      <EditorAccordionSection
        value="hero"
        title="Первый экран"
        description="Плашка, заголовок и главный текст на первом экране."
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
            label="Описание первого экрана"
            rows={4}
            value={homeForm.heroDescription}
            onChange={(value) => setHomeField("heroDescription", value)}
          />
        </div>
      </EditorAccordionSection>

      <EditorAccordionSection
        value="about"
        title="Блок «О нас»"
        description="Заголовок и два абзаца описания о проекте."
      >
        <div className="space-y-4">
          <Field
            label="Заголовок блока"
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
      </EditorAccordionSection>

      <EditorAccordionSection
        value="booking"
        title="Блок записи"
        description="Текст перед формой записи на консультацию."
      >
        <div className="space-y-4">
          <Field
            label="Заголовок блока"
            value={homeForm.bookingTitle}
            onChange={(value) => setHomeField("bookingTitle", value)}
          />
          <MarkdownTextareaField
            label="Описание блока"
            rows={4}
            value={homeForm.bookingDescription}
            onChange={(value) => setHomeField("bookingDescription", value)}
          />
        </div>
      </EditorAccordionSection>
    </Accordion>
  );
}
