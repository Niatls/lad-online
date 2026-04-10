"use client";

import { useMemo, useState } from "react";
import { Eye } from "lucide-react";

import { ContentPagesSection } from "@/components/admin/content-pages-section";
import { HomeContentSection } from "@/components/admin/home-content-section";
import {
  emptyPageForm,
  type PageFormState,
} from "@/components/admin/editor-types";
import { HomePageClient } from "@/components/home/home-page-client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { HomePageContent, ManagedContentPage } from "@/lib/content";

type AdminContentEditorProps = {
  homeContent: HomePageContent;
  pages: ManagedContentPage[];
};

type SavedPageResponse = Omit<ManagedContentPage, "updatedAt"> & {
  updatedAt: string | null;
};

export function AdminContentEditor({
  homeContent,
  pages,
}: AdminContentEditorProps) {
  const [homeForm, setHomeForm] = useState(homeContent);
  const [managedPages, setManagedPages] = useState(pages);
  const [pageForm, setPageForm] = useState<PageFormState>(emptyPageForm);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isSavingHome, setIsSavingHome] = useState(false);
  const [isSavingPage, setIsSavingPage] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  const previewArticles = useMemo(
    () =>
      managedPages.filter(
        (page) =>
          page.pageType === "article" &&
          page.published &&
          page.showOnHomepage
      ),
    [managedPages]
  );

  function setHomeField<K extends keyof HomePageContent>(
    key: K,
    value: HomePageContent[K]
  ) {
    setHomeForm((current) => ({ ...current, [key]: value }));
  }

  const saveHomeContent = async () => {
    setIsSavingHome(true);
    setStatusMessage("");

    const response = await fetch("/api/admin/content/home", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(homeForm),
    });
    const result = await response.json();

    setIsSavingHome(false);
    setStatusMessage(
      response.ok && result.ok
        ? "Главная страница сохранена."
        : result.message || "Не удалось сохранить главную страницу."
    );
  };

  const upsertManagedPage = (savedPage: ManagedContentPage) => {
    setManagedPages((current) => {
      const remaining = current.filter(
        (page) =>
          !(
            (savedPage.id !== null && page.id === savedPage.id) ||
            page.slug === savedPage.slug
          )
      );

      return [savedPage, ...remaining];
    });
  };

  const savePage = async () => {
    setIsSavingPage(true);
    setStatusMessage("");

    const payload = {
      ...pageForm,
      summaryPoints: pageForm.summaryPoints
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean),
    };

    const url = pageForm.id
      ? `/api/admin/content/pages/${pageForm.id}`
      : "/api/admin/content/pages";
    const method = pageForm.id ? "PUT" : "POST";

    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const result = await response.json();

    setIsSavingPage(false);
    if (!response.ok || !result.ok) {
      setStatusMessage(result.message || "Не удалось сохранить материал.");
      return;
    }

    if (result.page) {
      const responsePage = result.page as SavedPageResponse;
      const savedPage: ManagedContentPage = {
        ...responsePage,
        updatedAt: responsePage.updatedAt
          ? new Date(responsePage.updatedAt)
          : null,
      };

      upsertManagedPage(savedPage);
      setPageForm({
        id: savedPage.id,
        slug: savedPage.slug,
        title: savedPage.title,
        excerpt: savedPage.excerpt,
        content: savedPage.content,
        pageType: savedPage.pageType,
        published: savedPage.published,
        showOnHomepage: savedPage.showOnHomepage,
        summaryPoints: savedPage.summaryPoints.join("\n"),
        sourceLabel: savedPage.sourceLabel,
        sourceHref: savedPage.sourceHref,
        researchLabel: savedPage.researchLabel,
        researchHref: savedPage.researchHref,
      });

      const publicPath =
        savedPage.pageType === "article"
          ? `/articles/${savedPage.slug}`
          : `/pages/${savedPage.slug}`;

      setStatusMessage(
        savedPage.published
          ? `Материал сохранен и опубликован. Адрес: ${publicPath}`
          : "Материал сохранен как черновик. Он уже появился в списке слева, но пока не виден на сайте."
      );
      return;
    }

    setStatusMessage("Материал сохранен.");
  };

  const deletePage = async () => {
    if (!pageForm.id) {
      setStatusMessage("Удалять можно только уже сохраненные материалы.");
      return;
    }

    const response = await fetch(`/api/admin/content/pages/${pageForm.id}`, {
      method: "DELETE",
    });
    const result = await response.json();

    if (!response.ok || !result.ok) {
      setStatusMessage(result.message || "Не удалось удалить материал.");
      return;
    }

    setManagedPages((current) =>
      current.filter((page) => page.id !== pageForm.id)
    );
    setPageForm(emptyPageForm);
    setStatusMessage("Материал удален.");
  };

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-sage-light/30 bg-white/90 p-6 shadow-lg sm:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-forest">Редактор сайта</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-forest/60">
              Управляйте главной страницей, меню, услугами, контактами и
              материалами. После сохранения статьи редактор сразу покажет,
              опубликована она или осталась черновиком.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsPreviewOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-forest px-5 py-3 text-sm font-semibold text-white transition hover:bg-forest/90"
          >
            <Eye className="h-4 w-4" />
            Предпросмотр страницы
          </button>
        </div>

        {statusMessage ? (
          <p className="mt-6 rounded-xl bg-sage-light/20 px-4 py-3 text-sm text-forest">
            {statusMessage}
          </p>
        ) : null}
      </section>

      <HomeContentSection
        homeForm={homeForm}
        isSavingHome={isSavingHome}
        onOpenPreview={() => setIsPreviewOpen(true)}
        onSave={saveHomeContent}
        setHomeField={setHomeField}
      />

      <ContentPagesSection
        isSavingPage={isSavingPage}
        onDelete={deletePage}
        onReset={() => setPageForm(emptyPageForm)}
        onSave={savePage}
        pageForm={pageForm}
        pages={managedPages}
        setPageForm={setPageForm}
      />

      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent
          showCloseButton
          className="h-[92vh] max-w-[96vw] overflow-hidden border-0 p-0"
        >
          <DialogHeader className="border-b border-sage-light/20 px-6 py-4">
            <DialogTitle>Предпросмотр главной страницы</DialogTitle>
            <DialogDescription>
              Ниже отображается текущая версия страницы из редактора до
              публикации.
            </DialogDescription>
          </DialogHeader>
          <div className="h-full overflow-y-auto bg-cream">
            <HomePageClient
              articles={previewArticles}
              homeContent={homeForm}
              previewMode
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
