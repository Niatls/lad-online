"use client";

import type React from "react";

import type { ManagedContentPage } from "@/lib/content";

import {
  emptyPageForm,
  pageToFormState,
  type PageFormState,
} from "./editor-types";

type PageListSidebarProps = {
  pages: ManagedContentPage[];
  setPageForm: React.Dispatch<React.SetStateAction<PageFormState>>;
};

export function PageListSidebar({
  pages,
  setPageForm,
}: PageListSidebarProps) {
  return (
    <div className="rounded-[2rem] border border-sage-light/30 bg-white/90 p-6 shadow-lg">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-forest">Материалы</h2>
          <p className="text-sm text-forest/55">Статьи и отдельные страницы</p>
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
              {page.pageType === "article" ? "Статья" : "Страница"} · {page.slug}
            </p>
            {page.id === null ? (
              <p className="mt-1 text-xs text-forest/40">Встроенный материал</p>
            ) : null}
          </button>
        ))}
      </div>
    </div>
  );
}
