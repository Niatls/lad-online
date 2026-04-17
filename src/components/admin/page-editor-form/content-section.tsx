import { EditorAccordionSection } from "@/components/admin/editor-accordion-section";
import { MarkdownTextareaField } from "@/components/admin/editor-shared";

import type { PageEditorSectionProps } from "./types";

export function PageEditorContentSection({
  pageForm,
  setPageForm,
}: PageEditorSectionProps) {
  return (
    <EditorAccordionSection
      value="content"
      title={"\u0422\u0435\u043a\u0441\u0442 \u0438 \u0442\u0435\u0437\u0438\u0441\u044b"}
      description={
        "\u041a\u0440\u0430\u0442\u043a\u0438\u0435 \u0442\u0435\u0437\u0438\u0441\u044b \u0438 \u043f\u043e\u043b\u043d\u044b\u0439 \u0442\u0435\u043a\u0441\u0442 \u043c\u0430\u0442\u0435\u0440\u0438\u0430\u043b\u0430."
      }
    >
      <div className="space-y-4">
        <MarkdownTextareaField
          label={
            "\u041a\u043e\u0440\u043e\u0442\u043a\u0438\u0435 \u0442\u0435\u0437\u0438\u0441\u044b, \u043f\u043e \u043e\u0434\u043d\u043e\u043c\u0443 \u043d\u0430 \u0441\u0442\u0440\u043e\u043a\u0443"
          }
          rows={5}
          value={pageForm.summaryPoints}
          onChange={(summaryPoints) =>
            setPageForm((current) => ({ ...current, summaryPoints }))
          }
        />

        <MarkdownTextareaField
          label={"\u041f\u043e\u043b\u043d\u044b\u0439 \u0442\u0435\u043a\u0441\u0442"}
          rows={16}
          value={pageForm.content}
          onChange={(content) =>
            setPageForm((current) => ({ ...current, content }))
          }
          placeholder={
            "\u041c\u043e\u0436\u043d\u043e \u0438\u0441\u043f\u043e\u043b\u044c\u0437\u043e\u0432\u0430\u0442\u044c Markdown."
          }
        />
      </div>
    </EditorAccordionSection>
  );
}
