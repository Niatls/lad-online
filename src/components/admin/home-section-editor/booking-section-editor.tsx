import { Field, MarkdownTextareaField } from "@/components/admin/editor-shared";

import { SectionCard } from "./section-card";
import type { HomeSectionEditorFieldsProps } from "./types";

export function BookingSectionEditor({
  homeForm,
  setHomeField,
}: HomeSectionEditorFieldsProps) {
  return (
    <SectionCard
      title={"\u0411\u043b\u043e\u043a \u0437\u0430\u043f\u0438\u0441\u0438"}
      description={
        "\u0422\u0435\u043a\u0441\u0442 \u043f\u0435\u0440\u0435\u0434 \u0444\u043e\u0440\u043c\u043e\u0439 \u0437\u0430\u043f\u0438\u0441\u0438 \u0438 \u0437\u0430\u044f\u0432\u043a\u043e\u0439."
      }
    >
      <div className="space-y-4">
        <Field
          label={"\u0417\u0430\u0433\u043e\u043b\u043e\u0432\u043e\u043a"}
          value={homeForm.bookingTitle}
          onChange={(value) => setHomeField("bookingTitle", value)}
        />
        <MarkdownTextareaField
          label={"\u041e\u043f\u0438\u0441\u0430\u043d\u0438\u0435"}
          rows={4}
          value={homeForm.bookingDescription}
          onChange={(value) => setHomeField("bookingDescription", value)}
        />
      </div>
    </SectionCard>
  );
}
