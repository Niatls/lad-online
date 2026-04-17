import { Field, MarkdownTextareaField } from "@/components/admin/editor-shared";

import { SectionCard } from "./section-card";
import type { HomeSectionEditorFieldsProps } from "./types";

export function HeroSectionEditor({
  homeForm,
  setHomeField,
}: HomeSectionEditorFieldsProps) {
  return (
    <SectionCard
      title={"\u041f\u0435\u0440\u0432\u044b\u0439 \u044d\u043a\u0440\u0430\u043d"}
      description={
        "\u0413\u043b\u0430\u0432\u043d\u044b\u0439 \u0437\u0430\u0433\u043e\u043b\u043e\u0432\u043e\u043a, \u043f\u043b\u0430\u0448\u043a\u0430 \u0438 \u043e\u043f\u0438\u0441\u0430\u043d\u0438\u0435 \u0441\u0430\u0439\u0442\u0430."
      }
    >
      <div className="grid gap-4 md:grid-cols-2">
        <Field
          label={"\u041f\u043b\u0430\u0448\u043a\u0430"}
          value={homeForm.heroBadge}
          onChange={(value) => setHomeField("heroBadge", value)}
        />
        <Field
          label={"\u0417\u0430\u0433\u043e\u043b\u043e\u0432\u043e\u043a, \u043f\u0435\u0440\u0432\u0430\u044f \u0441\u0442\u0440\u043e\u043a\u0430"}
          value={homeForm.heroTitle}
          onChange={(value) => setHomeField("heroTitle", value)}
        />
        <Field
          label={"\u0417\u0430\u0433\u043e\u043b\u043e\u0432\u043e\u043a, \u0430\u043a\u0446\u0435\u043d\u0442"}
          value={homeForm.heroTitleAccent}
          onChange={(value) => setHomeField("heroTitleAccent", value)}
        />
      </div>
      <div className="mt-4">
        <MarkdownTextareaField
          label={"\u041e\u043f\u0438\u0441\u0430\u043d\u0438\u0435"}
          rows={5}
          value={homeForm.heroDescription}
          onChange={(value) => setHomeField("heroDescription", value)}
        />
      </div>
    </SectionCard>
  );
}
