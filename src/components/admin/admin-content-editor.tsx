"use client";

import { AdminContentEditorHeader } from "@/components/admin/admin-content-editor/header";
import { AdminContentPreviewDialog } from "@/components/admin/admin-content-editor/preview-dialog";
import { AdminContentEditorTabs } from "@/components/admin/admin-content-editor/tabs";
import type { AdminContentEditorProps } from "@/components/admin/admin-content-editor/types";
import { useAdminContentEditor } from "@/components/admin/admin-content-editor/use-admin-content-editor";

export function AdminContentEditor({
  homeContent,
  pages,
  onSaved,
}: AdminContentEditorProps) {
  const {
    deletePage,
    homeForm,
    isPreviewOpen,
    isSavingHome,
    isSavingPage,
    managedPages,
    pageForm,
    previewArticles,
    saveHomeContent,
    savePage,
    setHomeField,
    setIsPreviewOpen,
    setPageForm,
    statusMessage,
  } = useAdminContentEditor({
    homeContent,
    pages,
    onSaved,
  });

  return (
    <div className="space-y-6">
      <AdminContentEditorHeader
        onOpenPreview={() => setIsPreviewOpen(true)}
        statusMessage={statusMessage}
      />
      <AdminContentEditorTabs
        homeForm={homeForm}
        isSavingHome={isSavingHome}
        isSavingPage={isSavingPage}
        onDeletePage={deletePage}
        onOpenPreview={() => setIsPreviewOpen(true)}
        onSaveHome={saveHomeContent}
        onSavePage={savePage}
        pageForm={pageForm}
        pages={managedPages}
        setHomeField={setHomeField}
        setPageForm={setPageForm}
      />
      <AdminContentPreviewDialog
        articles={previewArticles}
        homeContent={homeForm}
        onOpenChange={setIsPreviewOpen}
        open={isPreviewOpen}
      />
    </div>
  );
}
