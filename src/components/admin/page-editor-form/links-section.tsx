import { EditorAccordionSection } from "@/components/admin/editor-accordion-section";
import { Field } from "@/components/admin/editor-shared";

import type { PageEditorSectionProps } from "./types";

export function PageEditorLinksSection({
  pageForm,
  setPageForm,
}: PageEditorSectionProps) {
  return (
    <EditorAccordionSection
      value="links"
      title={"\u0418\u0441\u0442\u043e\u0447\u043d\u0438\u043a\u0438"}
      description={
        "\u0421\u0441\u044b\u043b\u043a\u0438 \u043d\u0430 \u043f\u0435\u0440\u0432\u043e\u0438\u0441\u0442\u043e\u0447\u043d\u0438\u043a \u0438 \u0438\u0441\u0441\u043b\u0435\u0434\u043e\u0432\u0430\u043d\u0438\u0435."
      }
    >
      <div className="grid gap-4 md:grid-cols-2">
        <Field
          label={"\u041d\u0430\u0437\u0432\u0430\u043d\u0438\u0435 \u0438\u0441\u0442\u043e\u0447\u043d\u0438\u043a\u0430"}
          value={pageForm.sourceLabel}
          onChange={(sourceLabel) =>
            setPageForm((current) => ({ ...current, sourceLabel }))
          }
        />
        <Field
          label={"\u0421\u0441\u044b\u043b\u043a\u0430 \u043d\u0430 \u0438\u0441\u0442\u043e\u0447\u043d\u0438\u043a"}
          value={pageForm.sourceHref}
          onChange={(sourceHref) =>
            setPageForm((current) => ({ ...current, sourceHref }))
          }
        />
        <Field
          label={"\u041d\u0430\u0437\u0432\u0430\u043d\u0438\u0435 \u0438\u0441\u0441\u043b\u0435\u0434\u043e\u0432\u0430\u043d\u0438\u044f"}
          value={pageForm.researchLabel}
          onChange={(researchLabel) =>
            setPageForm((current) => ({ ...current, researchLabel }))
          }
        />
        <Field
          label={"\u0421\u0441\u044b\u043b\u043a\u0430 \u043d\u0430 \u0438\u0441\u0441\u043b\u0435\u0434\u043e\u0432\u0430\u043d\u0438\u0435"}
          value={pageForm.researchHref}
          onChange={(researchHref) =>
            setPageForm((current) => ({ ...current, researchHref }))
          }
        />
      </div>
    </EditorAccordionSection>
  );
}
