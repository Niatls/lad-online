import { Field, MarkdownTextareaField } from "@/components/admin/editor-shared";

import { SectionCard } from "./section-card";
import type { HomeSectionEditorFieldsProps } from "./types";

export function AboutSectionEditor({
  homeForm,
  setHomeField,
}: HomeSectionEditorFieldsProps) {
  return (
    <SectionCard
      title={"\u0411\u043b\u043e\u043a \u00ab\u041e \u043d\u0430\u0441\u00bb"}
      description={
        "\u041e\u0441\u043d\u043e\u0432\u043d\u043e\u0439 \u0442\u0435\u043a\u0441\u0442 \u043e \u043f\u0440\u043e\u0435\u043a\u0442\u0435 \u0438 \u0441\u043f\u0435\u0446\u0438\u0430\u043b\u0438\u0441\u0442\u0430\u0445."
      }
    >
      <div className="space-y-4">
        <Field
          label={"\u0417\u0430\u0433\u043e\u043b\u043e\u0432\u043e\u043a"}
          value={homeForm.aboutTitle}
          onChange={(value) => setHomeField("aboutTitle", value)}
        />
        <MarkdownTextareaField
          label={"\u041f\u0435\u0440\u0432\u044b\u0439 \u0430\u0431\u0437\u0430\u0446"}
          rows={4}
          value={homeForm.aboutIntro}
          onChange={(value) => setHomeField("aboutIntro", value)}
        />
        <MarkdownTextareaField
          label={"\u0412\u0442\u043e\u0440\u043e\u0439 \u0430\u0431\u0437\u0430\u0446"}
          rows={4}
          value={homeForm.aboutDescription}
          onChange={(value) => setHomeField("aboutDescription", value)}
        />
      </div>
    </SectionCard>
  );
}
