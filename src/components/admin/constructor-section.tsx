"use client";

import { useDroppable } from "@dnd-kit/core";
import { rectSortingStrategy, SortableContext } from "@dnd-kit/sortable";

import { GRID_COLS } from "@/components/admin/constructor-section/constants";
import { EmptyGridHint } from "@/components/admin/constructor-section/empty-grid-hint";
import { SortableElement } from "@/components/admin/constructor-section/sortable-element";
import { useLiveEditor } from "@/components/admin/live-editor-context";
import type { HomePageSection } from "@/lib/home-sections";

export function ConstructorSection({ section }: { section: HomePageSection }) {
  const elements = section.elements || [];
  const { isEditMode } = useLiveEditor();

  const { setNodeRef } = useDroppable({
    id: `container-${section.id}`,
    data: {
      type: "ConstructorSection",
      sectionId: section.id,
    },
  });

  return (
    <section className="relative w-full px-4 py-12">
      <div className="mx-auto max-w-7xl">
        <SortableContext items={elements.map((element) => element.id)} strategy={rectSortingStrategy}>
          <div
            ref={setNodeRef}
            data-grid-container
            className={`grid w-full min-h-[80px] gap-y-2 ${
              isEditMode && elements.length === 0
                ? "place-items-center rounded-[2rem] border-2 border-dashed border-sage/30 bg-sage/5 p-12"
                : ""
            }`}
            style={{
              gridTemplateColumns: `repeat(${GRID_COLS}, 1fr)`,
              gridAutoRows: "minmax(60px, auto)",
              ...(isEditMode
                ? {
                    backgroundImage: `repeating-linear-gradient(90deg, transparent, transparent calc(${
                      100 / GRID_COLS
                    }% - 1px), rgba(139,163,139,0.1) calc(${100 / GRID_COLS}% - 1px), rgba(139,163,139,0.1) ${
                      100 / GRID_COLS
                    }%)`,
                    backgroundSize: "100% 100%",
                  }
                : {}),
            }}
          >
            {elements.length === 0 && isEditMode ? <EmptyGridHint /> : null}
            {elements.map((element) => (
              <SortableElement key={element.id} sectionId={section.id} element={element} />
            ))}
          </div>
        </SortableContext>
      </div>
    </section>
  );
}
