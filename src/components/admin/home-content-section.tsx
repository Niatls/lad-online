"use client";

import { Eye, LayoutTemplate, Save } from "lucide-react";

import type { HomePageContent } from "@/lib/content";

import { HomeContentMainSections } from "./home-content-main-sections";
import { HomeContentSettingsSections } from "./home-content-settings-sections";
import { SectionShell } from "./editor-shared";
import { ActionButton } from "./home-content-cards";

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
          ? "Редактируйте первый экран, блок «О нас» и секцию записи отдельными компактными блоками."
          : "Здесь собраны меню, контакты и услуги. Каждый раздел можно открыть отдельно без длинной простыни полей."
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
          Открыть предпросмотр
        </button>
      </div>
    </SectionShell>
  );
}
