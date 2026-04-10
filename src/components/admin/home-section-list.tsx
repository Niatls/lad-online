"use client";

import {
  ArrowDown,
  ArrowUp,
  Eye,
  EyeOff,
  Plus,
  Quote,
  Sparkles,
  Trash2,
} from "lucide-react";

import {
  createCustomHomeSection,
  getSectionDisplayTitle,
  type HomePageSection,
  type HomeSectionVariant,
} from "@/lib/home-sections";

type HomeSectionListProps = {
  onAddSection: (section: HomePageSection) => void;
  onDeleteSection: (id: string) => void;
  onMoveSection: (id: string, direction: "up" | "down") => void;
  onSelectSection: (id: string) => void;
  onToggleSection: (id: string) => void;
  sections: HomePageSection[];
  selectedSectionId: string | null;
};

const customTemplates: Array<{
  label: string;
  variant: HomeSectionVariant;
  icon: typeof Sparkles;
}> = [
  { label: "Инфо-блок", variant: "default", icon: Plus },
  { label: "Акцентный блок", variant: "highlight", icon: Sparkles },
  { label: "Цитата", variant: "quote", icon: Quote },
];

export function HomeSectionList({
  onAddSection,
  onDeleteSection,
  onMoveSection,
  onSelectSection,
  onToggleSection,
  sections,
  selectedSectionId,
}: HomeSectionListProps) {
  return (
    <div className="space-y-4 rounded-[1.5rem] border border-sage-light/20 bg-white p-5">
      <div>
        <h3 className="text-lg font-semibold text-forest">Секции главной</h3>
        <p className="mt-1 text-sm leading-6 text-forest/55">
          Меняйте порядок, скрывайте блоки и добавляйте новые секции-шаблоны.
        </p>
      </div>

      <div className="grid gap-2">
        {customTemplates.map((template) => (
          <button
            key={template.label}
            type="button"
            onClick={() => onAddSection(createCustomHomeSection(template.variant))}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-cream px-4 py-3 text-sm font-semibold text-forest transition hover:bg-sage-light/20"
          >
            <template.icon className="h-4 w-4" />
            {template.label}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {sections.map((section, index) => {
          const isSelected = section.id === selectedSectionId;

          return (
            <div
              key={section.id}
              className={`rounded-2xl border p-4 transition ${
                isSelected
                  ? "border-sage bg-sage-light/10 shadow-sm"
                  : "border-sage-light/20 bg-cream/70"
              }`}
            >
              <button
                type="button"
                onClick={() => onSelectSection(section.id)}
                className="w-full text-left"
              >
                <p className="text-sm font-semibold text-forest">
                  {getSectionDisplayTitle(section)}
                </p>
                <p className="mt-1 text-xs uppercase tracking-[0.2em] text-forest/35">
                  {section.kind === "custom" ? "Своя секция" : "Шаблон сайта"}
                </p>
              </button>

              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => onMoveSection(section.id, "up")}
                  disabled={index === 0}
                  className="rounded-lg bg-white p-2 text-forest/70 transition hover:bg-sage-light/20 disabled:opacity-40"
                >
                  <ArrowUp className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => onMoveSection(section.id, "down")}
                  disabled={index === sections.length - 1}
                  className="rounded-lg bg-white p-2 text-forest/70 transition hover:bg-sage-light/20 disabled:opacity-40"
                >
                  <ArrowDown className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => onToggleSection(section.id)}
                  className="rounded-lg bg-white p-2 text-forest/70 transition hover:bg-sage-light/20"
                >
                  {section.enabled ? (
                    <Eye className="h-4 w-4" />
                  ) : (
                    <EyeOff className="h-4 w-4" />
                  )}
                </button>
                {section.kind === "custom" ? (
                  <button
                    type="button"
                    onClick={() => onDeleteSection(section.id)}
                    className="rounded-lg bg-red-50 p-2 text-red-700 transition hover:bg-red-100"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
