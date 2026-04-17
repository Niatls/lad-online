import { EditorAccordionSection } from "@/components/admin/editor-accordion-section";

import type { PageEditorSectionProps } from "./types";

export function PageEditorPublishSection({
  pageForm,
  setPageForm,
}: PageEditorSectionProps) {
  return (
    <EditorAccordionSection
      value="publish"
      title={"\u041f\u0443\u0431\u043b\u0438\u043a\u0430\u0446\u0438\u044f"}
      description={
        "\u041d\u0430\u0441\u0442\u0440\u043e\u0439\u043a\u0438 \u043f\u0443\u0431\u043b\u0438\u043a\u0430\u0446\u0438\u0438 \u0438 \u0432\u044b\u0432\u043e\u0434\u0430 \u043d\u0430 \u0433\u043b\u0430\u0432\u043d\u0443\u044e."
      }
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
          {"\u041e\u043f\u0443\u0431\u043b\u0438\u043a\u043e\u0432\u0430\u043d\u043e"}
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
          {"\u041f\u043e\u043a\u0430\u0437\u044b\u0432\u0430\u0442\u044c \u043d\u0430 \u0433\u043b\u0430\u0432\u043d\u043e\u0439"}
        </label>
      </div>
    </EditorAccordionSection>
  );
}
