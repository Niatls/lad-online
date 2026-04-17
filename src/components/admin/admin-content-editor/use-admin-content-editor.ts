"use client";

import { useMemo, useState } from "react";

import { emptyPageForm, type PageFormState } from "@/components/admin/editor-types";
import type { HomePageContent, ManagedContentPage } from "@/lib/content";

import type { SavedPageResponse } from "./types";

type UseAdminContentEditorParams = {
  homeContent: HomePageContent;
  pages: ManagedContentPage[];
  onSaved?: () => void;
};

export function useAdminContentEditor({
  homeContent,
  pages,
  onSaved,
}: UseAdminContentEditorParams) {
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
        ? "\u0413\u043b\u0430\u0432\u043d\u0430\u044f \u0441\u0442\u0440\u0430\u043d\u0438\u0446\u0430 \u0441\u043e\u0445\u0440\u0430\u043d\u0435\u043d\u0430."
        : result.message ||
            "\u041d\u0435 \u0443\u0434\u0430\u043b\u043e\u0441\u044c \u0441\u043e\u0445\u0440\u0430\u043d\u0438\u0442\u044c \u0433\u043b\u0430\u0432\u043d\u0443\u044e \u0441\u0442\u0440\u0430\u043d\u0438\u0446\u0443."
    );

    if (response.ok && result.ok) {
      onSaved?.();
    }
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
      setStatusMessage(
        result.message ||
          "\u041d\u0435 \u0443\u0434\u0430\u043b\u043e\u0441\u044c \u0441\u043e\u0445\u0440\u0430\u043d\u0438\u0442\u044c \u043c\u0430\u0442\u0435\u0440\u0438\u0430\u043b."
      );
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
          ? `\u041c\u0430\u0442\u0435\u0440\u0438\u0430\u043b \u0441\u043e\u0445\u0440\u0430\u043d\u0435\u043d \u0438 \u043e\u043f\u0443\u0431\u043b\u0438\u043a\u043e\u0432\u0430\u043d. \u0410\u0434\u0440\u0435\u0441: ${publicPath}`
          : "\u041c\u0430\u0442\u0435\u0440\u0438\u0430\u043b \u0441\u043e\u0445\u0440\u0430\u043d\u0435\u043d \u043a\u0430\u043a \u0447\u0435\u0440\u043d\u043e\u0432\u0438\u043a. \u041e\u043d \u0443\u0436\u0435 \u043f\u043e\u044f\u0432\u0438\u043b\u0441\u044f \u0432 \u0441\u043f\u0438\u0441\u043a\u0435 \u0441\u043b\u0435\u0432\u0430, \u043d\u043e \u043f\u043e\u043a\u0430 \u043d\u0435 \u0432\u0438\u0434\u0435\u043d \u043d\u0430 \u0441\u0430\u0439\u0442\u0435."
      );
      onSaved?.();
      return;
    }

    setStatusMessage("\u041c\u0430\u0442\u0435\u0440\u0438\u0430\u043b \u0441\u043e\u0445\u0440\u0430\u043d\u0435\u043d.");
    onSaved?.();
  };

  const deletePage = async () => {
    if (!pageForm.id) {
      setStatusMessage(
        "\u0423\u0434\u0430\u043b\u044f\u0442\u044c \u043c\u043e\u0436\u043d\u043e \u0442\u043e\u043b\u044c\u043a\u043e \u0443\u0436\u0435 \u0441\u043e\u0445\u0440\u0430\u043d\u0435\u043d\u043d\u044b\u0435 \u043c\u0430\u0442\u0435\u0440\u0438\u0430\u043b\u044b."
      );
      return;
    }

    const response = await fetch(`/api/admin/content/pages/${pageForm.id}`, {
      method: "DELETE",
    });
    const result = await response.json();

    if (!response.ok || !result.ok) {
      setStatusMessage(
        result.message ||
          "\u041d\u0435 \u0443\u0434\u0430\u043b\u043e\u0441\u044c \u0443\u0434\u0430\u043b\u0438\u0442\u044c \u043c\u0430\u0442\u0435\u0440\u0438\u0430\u043b."
      );
      return;
    }

    setManagedPages((current) =>
      current.filter((page) => page.id !== pageForm.id)
    );
    setPageForm(emptyPageForm);
    setStatusMessage("\u041c\u0430\u0442\u0435\u0440\u0438\u0430\u043b \u0443\u0434\u0430\u043b\u0435\u043d.");
    onSaved?.();
  };

  return {
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
  };
}
