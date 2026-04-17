import { EditorAccordionSection } from "@/components/admin/editor-accordion-section";
import { Field, MarkdownTextareaField } from "@/components/admin/editor-shared";

import type { PageEditorSectionProps } from "./types";

export function PageEditorBasicSection({
  pageForm,
  setPageForm,
}: PageEditorSectionProps) {
  return (
    <EditorAccordionSection
      value="basic"
      title={"\u041e\u0441\u043d\u043e\u0432\u043d\u043e\u0435"}
      description={
        "\u0422\u0438\u043f \u043c\u0430\u0442\u0435\u0440\u0438\u0430\u043b\u0430, slug, \u0437\u0430\u0433\u043e\u043b\u043e\u0432\u043e\u043a \u0438 \u043a\u0440\u0430\u0442\u043a\u043e\u0435 \u043e\u043f\u0438\u0441\u0430\u043d\u0438\u0435."
      }
    >
      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm font-medium text-forest">
            {"\u0422\u0438\u043f"}
          </span>
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
            <option value="article">{"\u0421\u0442\u0430\u0442\u044c\u044f"}</option>
            <option value="page">{"\u0421\u0442\u0440\u0430\u043d\u0438\u0446\u0430"}</option>
          </select>
        </label>

        <Field
          label="Slug"
          value={pageForm.slug}
          onChange={(slug) => setPageForm((current) => ({ ...current, slug }))}
        />
      </div>

      <div className="mt-4 space-y-4">
        <Field
          label={"\u0417\u0430\u0433\u043e\u043b\u043e\u0432\u043e\u043a"}
          value={pageForm.title}
          onChange={(title) => setPageForm((current) => ({ ...current, title }))}
        />

        <MarkdownTextareaField
          label={"\u041a\u0440\u0430\u0442\u043a\u043e\u0435 \u043e\u043f\u0438\u0441\u0430\u043d\u0438\u0435"}
          rows={3}
          value={pageForm.excerpt}
          onChange={(excerpt) =>
            setPageForm((current) => ({ ...current, excerpt }))
          }
        />
      </div>
    </EditorAccordionSection>
  );
}
