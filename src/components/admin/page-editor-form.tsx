"use client";

import type React from "react";
import { SquarePen } from "lucide-react";

import { PageEditorActionsFooter } from "@/components/admin/page-editor-form/actions-footer";
import { PageEditorBasicSection } from "@/components/admin/page-editor-form/basic-section";
import { PageEditorContentSection } from "@/components/admin/page-editor-form/content-section";
import { PageEditorLinksSection } from "@/components/admin/page-editor-form/links-section";
import { PageEditorPublishSection } from "@/components/admin/page-editor-form/publish-section";
import { Accordion } from "@/components/ui/accordion";

import { SectionShell } from "./editor-shared";
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
      title={
        pageForm.id
          ? "\u0420\u0435\u0434\u0430\u043a\u0442\u0438\u0440\u043e\u0432\u0430\u043d\u0438\u0435 \u043c\u0430\u0442\u0435\u0440\u0438\u0430\u043b\u0430"
          : "\u041d\u043e\u0432\u044b\u0439 \u043c\u0430\u0442\u0435\u0440\u0438\u0430\u043b"
      }
      description={
        "\u0414\u043b\u044f \u0441\u0442\u0430\u0442\u0435\u0439 \u0443\u043a\u0430\u0436\u0438\u0442\u0435 \u0442\u0435\u0437\u0438\u0441\u044b \u0438 \u0442\u0435\u043a\u0441\u0442 \u0432 Markdown. \u0410\u043a\u043a\u043e\u0440\u0434\u0435\u043e\u043d\u044b \u043f\u043e\u043c\u043e\u0433\u0430\u044e\u0442 \u0440\u0435\u0434\u0430\u043a\u0442\u0438\u0440\u043e\u0432\u0430\u0442\u044c \u043c\u0430\u0442\u0435\u0440\u0438\u0430\u043b \u043f\u043e \u0447\u0430\u0441\u0442\u044f\u043c, \u0431\u0435\u0437 \u043f\u0435\u0440\u0435\u0433\u0440\u0443\u0436\u0435\u043d\u043d\u043e\u0439 \u0444\u043e\u0440\u043c\u044b."
      }
      icon={SquarePen}
    >
      <Accordion
        type="multiple"
        defaultValue={["basic", "content", "publish"]}
        className="space-y-4"
      >
        <PageEditorBasicSection
          pageForm={pageForm}
          setPageForm={setPageForm}
        />
        <PageEditorContentSection
          pageForm={pageForm}
          setPageForm={setPageForm}
        />
        <PageEditorLinksSection
          pageForm={pageForm}
          setPageForm={setPageForm}
        />
        <PageEditorPublishSection
          pageForm={pageForm}
          setPageForm={setPageForm}
        />
      </Accordion>

      <PageEditorActionsFooter
        hasPageId={Boolean(pageForm.id)}
        isSavingPage={isSavingPage}
        onDelete={onDelete}
        onReset={onReset}
        onSave={onSave}
      />
    </SectionShell>
  );
}
