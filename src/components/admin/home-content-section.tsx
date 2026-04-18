"use client";

import { Eye, LayoutTemplate, Save } from "lucide-react";

import type { HomePageContent } from "@/lib/content";

import { SectionShell } from "./editor-shared";
import { ActionButton } from "./home-content-cards";
import { HomeContentMainSections } from "./home-content-main-sections";
import { HomeContentSettingsSections } from "./home-content-settings-sections";

type HomeContentSectionProps = {
  homeForm: HomePageContent;
  isSavingHome: boolean;
  mode: "main" | "settings";
  onOpenPreview: () => void;
  onSave: () => void;
  setHomeField: <K extends keyof HomePageContent>(
    key: K,
    value: HomePageContent[K]
  ) => void;
};

export function HomeContentSection({
  homeForm,
  isSavingHome,
  mode,
  onOpenPreview,
  onSave,
  setHomeField,
}: HomeContentSectionProps) {
  return (
    <SectionShell
      title={mode === "main" ? "Главная страница" : "Навигация и контакты"}
      description={
        mode === "main"
          ? "Конструктор секций главной страницы: порядок блоков, свои вставки и полноэкранный предпросмотр."
          : "Меню, контакты и услуги собраны отдельно. Их порядок тоже можно менять перетаскиванием."
      }
      icon={LayoutTemplate}
    >
      {mode === "main" ? (
        <HomeContentMainSections
          homeForm={homeForm}
          setHomeField={setHomeField}
        />
      ) : (
        <HomeContentSettingsSections
          homeForm={homeForm}
          setHomeField={setHomeField}
        />
      )}

      <div className="mt-6 flex flex-wrap gap-3">
        <ActionButton
          label={isSavingHome ? "Сохраняю..." : "Сохранить главную"}
          onClick={onSave}
          icon={Save}
          disabled={isSavingHome}
        />
        <button
          type="button"
          onClick={onOpenPreview}
          className="inline-flex items-center gap-2 rounded-xl bg-cream px-5 py-3 text-sm font-semibold text-forest transition hover:bg-sage-light/20"
        >
          <Eye className="h-4 w-4" />
          Полноэкранный предпросмотр
        </button>
      </div>
    </SectionShell>
  );
}
