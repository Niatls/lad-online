"use client";

import type React from "react";

import type { ManagedContentPage } from "@/lib/content";

import { PageEditorForm } from "./page-editor-form";
import type { PageFormState } from "./editor-types";
import { PageListSidebar } from "./page-list-sidebar";

type ContentPagesSectionProps = {
  isSavingPage: boolean;
  onDelete: () => void;
  onReset: () => void;
  onSave: () => void;
  pageForm: PageFormState;
  pages: ManagedContentPage[];
  setPageForm: React.Dispatch<React.SetStateAction<PageFormState>>;
};

export function ContentPagesSection({
  isSavingPage,
  onDelete,
  onReset,
  onSave,
  pageForm,
  pages,
  setPageForm,
}: ContentPagesSectionProps) {
  return (
    <section className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
      <PageListSidebar pages={pages} setPageForm={setPageForm} />
      <PageEditorForm
        isSavingPage={isSavingPage}
        onDelete={onDelete}
        onReset={onReset}
        onSave={onSave}
        pageForm={pageForm}
        setPageForm={setPageForm}
      />
    </section>
  );
}
