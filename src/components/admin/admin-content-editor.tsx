"use client";

import { useState } from "react";

import type { HomePageContent, ManagedContentPage } from "@/lib/content";

type AdminContentEditorProps = {
  homeContent: HomePageContent;
  pages: ManagedContentPage[];
};

type PageFormState = {
  content: string;
  excerpt: string;
  id: number | null;
  pageType: "article" | "page";
  published: boolean;
  researchHref: string;
  researchLabel: string;
  showOnHomepage: boolean;
  slug: string;
  sourceHref: string;
  sourceLabel: string;
  summaryPoints: string;
  title: string;
};

const emptyPageForm: PageFormState = {
  id: null,
  slug: "",
  title: "",
  excerpt: "",
  content: "",
  pageType: "article",
  published: true,
  showOnHomepage: true,
  summaryPoints: "",
  sourceLabel: "",
  sourceHref: "",
  researchLabel: "",
  researchHref: "",
};

function pageToFormState(page: ManagedContentPage): PageFormState {
  return {
    id: page.id,
    slug: page.slug,
    title: page.title,
    excerpt: page.excerpt,
    content: page.content,
    pageType: page.pageType,
    published: page.published,
    showOnHomepage: page.showOnHomepage,
    summaryPoints: page.summaryPoints.join("\n"),
    sourceLabel: page.sourceLabel,
    sourceHref: page.sourceHref,
    researchLabel: page.researchLabel,
    researchHref: page.researchHref,
  };
}

export function AdminContentEditor({
  homeContent,
  pages,
}: AdminContentEditorProps) {
  const [homeForm, setHomeForm] = useState(homeContent);
  const [pageForm, setPageForm] = useState<PageFormState>(emptyPageForm);
  const [isSavingHome, setIsSavingHome] = useState(false);
  const [isSavingPage, setIsSavingPage] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

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

    setStatusMessage("Материал сохранен. Обновляю страницу...");
    window.location.reload();
  };

  const deletePage = async () => {
    if (!pageForm.id) {
      setStatusMessage("Можно удалить только сохраненный материал из базы.");
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

    setStatusMessage("Материал удален. Обновляю страницу...");
    window.location.reload();
  };

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-sage-light/30 bg-white/90 p-6 shadow-lg sm:p-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-forest">Редактор сайта</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-forest/60">
            Здесь можно редактировать тексты главной, создавать новые статьи и
            заводить отдельные страницы сайта.
          </p>
        </div>

        {statusMessage ? (
          <p className="rounded-xl bg-sage-light/20 px-4 py-3 text-sm text-forest">
            {statusMessage}
          </p>
        ) : null}
      </section>

      <section className="rounded-[2rem] border border-sage-light/30 bg-white/90 p-6 shadow-lg sm:p-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-forest">Главная страница</h2>
          <p className="mt-2 text-sm text-forest/55">
            Редактируются ключевые тексты первого экрана, блока «О нас» и формы
            записи.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {(
            [
              ["heroBadge", "Плашка"],
              ["heroTitle", "Заголовок, первая строка"],
              ["heroTitleAccent", "Заголовок, акцент"],
              ["aboutTitle", "Заголовок блока «О нас»"],
              ["bookingTitle", "Заголовок блока записи"],
            ] as const
          ).map(([field, label]) => (
            <label key={field} className="space-y-2">
              <span className="text-sm font-medium text-forest">{label}</span>
              <input
                value={homeForm[field]}
                onChange={(event) =>
                  setHomeForm((current) => ({
                    ...current,
                    [field]: event.target.value,
                  }))
                }
                className="w-full rounded-xl border border-sage-light/30 bg-white px-4 py-3 text-sm text-forest outline-none transition focus:border-sage"
              />
            </label>
          ))}
        </div>

        <div className="mt-4 grid gap-4">
          {(
            [
              ["heroDescription", "Описание первого экрана"],
              ["aboutIntro", "Первый абзац блока «О нас»"],
              ["aboutDescription", "Второй абзац блока «О нас»"],
              ["bookingDescription", "Описание блока записи"],
            ] as const
          ).map(([field, label]) => (
            <label key={field} className="space-y-2">
              <span className="text-sm font-medium text-forest">{label}</span>
              <textarea
                rows={4}
                value={homeForm[field]}
                onChange={(event) =>
                  setHomeForm((current) => ({
                    ...current,
                    [field]: event.target.value,
                  }))
                }
                className="w-full rounded-xl border border-sage-light/30 bg-white px-4 py-3 text-sm text-forest outline-none transition focus:border-sage"
              />
            </label>
          ))}
        </div>

        <button
          type="button"
          onClick={saveHomeContent}
          disabled={isSavingHome}
          className="mt-6 rounded-xl bg-sage px-5 py-3 text-sm font-semibold text-white transition hover:bg-sage-dark disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSavingHome ? "Сохраняю..." : "Сохранить главную"}
        </button>
      </section>

      <section className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
        <div className="rounded-[2rem] border border-sage-light/30 bg-white/90 p-6 shadow-lg">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-forest">Материалы</h2>
              <p className="text-sm text-forest/55">
                Статьи и отдельные страницы
              </p>
            </div>
            <button
              type="button"
              onClick={() => setPageForm(emptyPageForm)}
              className="rounded-xl bg-cream px-3 py-2 text-sm font-semibold text-forest transition hover:bg-sage-light/20"
            >
              Новый
            </button>
          </div>

          <div className="space-y-3">
            {pages.map((page) => (
              <button
                key={`${page.slug}-${page.id ?? "fallback"}`}
                type="button"
                onClick={() => setPageForm(pageToFormState(page))}
                className="w-full rounded-xl border border-sage-light/20 bg-cream px-4 py-3 text-left transition hover:border-sage/40"
              >
                <p className="text-sm font-semibold text-forest">{page.title}</p>
                <p className="mt-1 text-xs uppercase tracking-[0.2em] text-forest/40">
                  {page.pageType === "article" ? "Статья" : "Страница"} ·{" "}
                  {page.slug}
                </p>
                {page.id === null ? (
                  <p className="mt-1 text-xs text-forest/40">Встроенный материал</p>
                ) : null}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-[2rem] border border-sage-light/30 bg-white/90 p-6 shadow-lg sm:p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-forest">
              {pageForm.id ? "Редактирование материала" : "Новый материал"}
            </h2>
            <p className="mt-2 text-sm text-forest/55">
              Для статей укажи краткие тезисы, а для обычных страниц можно
              оставить их пустыми. Полный текст поддерживает Markdown.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm font-medium text-forest">Тип</span>
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
                <option value="article">Статья</option>
                <option value="page">Страница</option>
              </select>
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium text-forest">Slug</span>
              <input
                value={pageForm.slug}
                onChange={(event) =>
                  setPageForm((current) => ({
                    ...current,
                    slug: event.target.value,
                  }))
                }
                className="w-full rounded-xl border border-sage-light/30 bg-white px-4 py-3 text-sm text-forest outline-none transition focus:border-sage"
              />
            </label>
          </div>

          <div className="mt-4 grid gap-4">
            <label className="space-y-2">
              <span className="text-sm font-medium text-forest">Заголовок</span>
              <input
                value={pageForm.title}
                onChange={(event) =>
                  setPageForm((current) => ({
                    ...current,
                    title: event.target.value,
                  }))
                }
                className="w-full rounded-xl border border-sage-light/30 bg-white px-4 py-3 text-sm text-forest outline-none transition focus:border-sage"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium text-forest">Краткое описание</span>
              <textarea
                rows={3}
                value={pageForm.excerpt}
                onChange={(event) =>
                  setPageForm((current) => ({
                    ...current,
                    excerpt: event.target.value,
                  }))
                }
                className="w-full rounded-xl border border-sage-light/30 bg-white px-4 py-3 text-sm text-forest outline-none transition focus:border-sage"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium text-forest">
                Короткие тезисы, по одному на строку
              </span>
              <textarea
                rows={5}
                value={pageForm.summaryPoints}
                onChange={(event) =>
                  setPageForm((current) => ({
                    ...current,
                    summaryPoints: event.target.value,
                  }))
                }
                className="w-full rounded-xl border border-sage-light/30 bg-white px-4 py-3 text-sm text-forest outline-none transition focus:border-sage"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium text-forest">
                Полный текст, можно Markdown
              </span>
              <textarea
                rows={14}
                value={pageForm.content}
                onChange={(event) =>
                  setPageForm((current) => ({
                    ...current,
                    content: event.target.value,
                  }))
                }
                className="w-full rounded-xl border border-sage-light/30 bg-white px-4 py-3 font-mono text-sm text-forest outline-none transition focus:border-sage"
              />
            </label>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm font-medium text-forest">Название источника</span>
              <input
                value={pageForm.sourceLabel}
                onChange={(event) =>
                  setPageForm((current) => ({
                    ...current,
                    sourceLabel: event.target.value,
                  }))
                }
                className="w-full rounded-xl border border-sage-light/30 bg-white px-4 py-3 text-sm text-forest outline-none transition focus:border-sage"
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium text-forest">Ссылка на источник</span>
              <input
                value={pageForm.sourceHref}
                onChange={(event) =>
                  setPageForm((current) => ({
                    ...current,
                    sourceHref: event.target.value,
                  }))
                }
                className="w-full rounded-xl border border-sage-light/30 bg-white px-4 py-3 text-sm text-forest outline-none transition focus:border-sage"
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium text-forest">Название исследования</span>
              <input
                value={pageForm.researchLabel}
                onChange={(event) =>
                  setPageForm((current) => ({
                    ...current,
                    researchLabel: event.target.value,
                  }))
                }
                className="w-full rounded-xl border border-sage-light/30 bg-white px-4 py-3 text-sm text-forest outline-none transition focus:border-sage"
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium text-forest">Ссылка на исследование</span>
              <input
                value={pageForm.researchHref}
                onChange={(event) =>
                  setPageForm((current) => ({
                    ...current,
                    researchHref: event.target.value,
                  }))
                }
                className="w-full rounded-xl border border-sage-light/30 bg-white px-4 py-3 text-sm text-forest outline-none transition focus:border-sage"
              />
            </label>
          </div>

          <div className="mt-4 flex flex-wrap gap-6">
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
              Опубликовано
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
              Показывать на главной
            </label>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={savePage}
              disabled={isSavingPage}
              className="rounded-xl bg-sage px-5 py-3 text-sm font-semibold text-white transition hover:bg-sage-dark disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSavingPage ? "Сохраняю..." : "Сохранить материал"}
            </button>
            <button
              type="button"
              onClick={() => setPageForm(emptyPageForm)}
              className="rounded-xl bg-cream px-5 py-3 text-sm font-semibold text-forest transition hover:bg-sage-light/20"
            >
              Очистить форму
            </button>
            {pageForm.id ? (
              <button
                type="button"
                onClick={deletePage}
                className="rounded-xl bg-red-50 px-5 py-3 text-sm font-semibold text-red-700 transition hover:bg-red-100"
              >
                Удалить
              </button>
            ) : null}
          </div>
        </div>
      </section>
    </div>
  );
}
