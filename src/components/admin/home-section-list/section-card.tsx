import { ArrowDown, ArrowUp, Eye, EyeOff, GripVertical, Trash2 } from "lucide-react";

import { getSectionDisplayTitle, type HomePageSection } from "@/lib/home-sections";

import type { HomeSectionMoveDirection } from "./types";

type SectionCardProps = {
  draggingSectionId: string | null;
  index: number;
  isLast: boolean;
  isSelected: boolean;
  onDeleteSection: (id: string) => void;
  onMoveSection: (id: string, direction: HomeSectionMoveDirection) => void;
  onReorderSections: (fromId: string, toId: string) => void;
  onSelectSection: (id: string) => void;
  onToggleSection: (id: string) => void;
  section: HomePageSection;
  setDraggingSectionId: (id: string | null) => void;
};

export function SectionCard({
  draggingSectionId,
  index,
  isLast,
  isSelected,
  onDeleteSection,
  onMoveSection,
  onReorderSections,
  onSelectSection,
  onToggleSection,
  section,
  setDraggingSectionId,
}: SectionCardProps) {
  return (
    <div
      draggable
      onDragStart={() => setDraggingSectionId(section.id)}
      onDragEnd={() => setDraggingSectionId(null)}
      onDragOver={(event) => event.preventDefault()}
      onDrop={() => {
        if (draggingSectionId && draggingSectionId !== section.id) {
          onReorderSections(draggingSectionId, section.id);
        }
        setDraggingSectionId(null);
      }}
      className={`rounded-2xl border p-4 transition ${
        isSelected ? "border-sage bg-sage-light/10 shadow-sm" : "border-sage-light/20 bg-cream/70"
      } ${draggingSectionId === section.id ? "opacity-60" : ""}`}
    >
      <div className="flex items-start gap-3">
        <button
          type="button"
          aria-label="\u041f\u0435\u0440\u0435\u0442\u0430\u0449\u0438\u0442\u044c \u0441\u0435\u043a\u0446\u0438\u044e"
          className="rounded-lg bg-white p-2 text-forest/50 transition hover:bg-sage-light/20 hover:text-forest"
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => onSelectSection(section.id)}
          className="flex-1 text-left"
        >
          <p className="text-sm font-semibold text-forest">
            {getSectionDisplayTitle(section)}
          </p>
          <p className="mt-1 text-xs uppercase tracking-[0.2em] text-forest/35">
            {section.kind === "custom"
              ? "\u0421\u0432\u043e\u044f \u0441\u0435\u043a\u0446\u0438\u044f"
              : "\u0428\u0430\u0431\u043b\u043e\u043d \u0441\u0430\u0439\u0442\u0430"}
          </p>
        </button>
      </div>

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
          disabled={isLast}
          className="rounded-lg bg-white p-2 text-forest/70 transition hover:bg-sage-light/20 disabled:opacity-40"
        >
          <ArrowDown className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => onToggleSection(section.id)}
          className="rounded-lg bg-white p-2 text-forest/70 transition hover:bg-sage-light/20"
        >
          {section.enabled ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
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
}
