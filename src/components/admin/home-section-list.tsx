"use client";

import { useState } from "react";

import { AddSectionButtons } from "@/components/admin/home-section-list/add-section-buttons";
import { SectionCard } from "@/components/admin/home-section-list/section-card";
import type { HomeSectionListProps } from "@/components/admin/home-section-list/types";

export function HomeSectionList({
  onAddSection,
  onDeleteSection,
  onMoveSection,
  onReorderSections,
  onSelectSection,
  onToggleSection,
  sections,
  selectedSectionId,
}: HomeSectionListProps) {
  const [draggingSectionId, setDraggingSectionId] = useState<string | null>(null);

  return (
    <div className="space-y-4 rounded-[1.5rem] border border-sage-light/20 bg-white p-5">
      <div>
        <h3 className="text-lg font-semibold text-forest">
          {"\u0421\u0435\u043a\u0446\u0438\u0438 \u0433\u043b\u0430\u0432\u043d\u043e\u0439"}
        </h3>
        <p className="mt-1 text-sm leading-6 text-forest/55">
          {
            "\u041c\u0435\u043d\u044f\u0439\u0442\u0435 \u043f\u043e\u0440\u044f\u0434\u043e\u043a \u043c\u044b\u0448\u043a\u043e\u0439, \u0441\u043a\u0440\u044b\u0432\u0430\u0439\u0442\u0435 \u0431\u043b\u043e\u043a\u0438 \u0438 \u0434\u043e\u0431\u0430\u0432\u043b\u044f\u0439\u0442\u0435 \u043d\u043e\u0432\u044b\u0435 \u0441\u0435\u043a\u0446\u0438\u0438-\u0448\u0430\u0431\u043b\u043e\u043d\u044b."
          }
        </p>
      </div>

      <AddSectionButtons onAddSection={onAddSection} />

      <div className="space-y-3">
        {sections.map((section, index) => (
          <SectionCard
            key={section.id}
            draggingSectionId={draggingSectionId}
            index={index}
            isLast={index === sections.length - 1}
            isSelected={section.id === selectedSectionId}
            onDeleteSection={onDeleteSection}
            onMoveSection={onMoveSection}
            onReorderSections={onReorderSections}
            onSelectSection={onSelectSection}
            onToggleSection={onToggleSection}
            section={section}
            setDraggingSectionId={setDraggingSectionId}
          />
        ))}
      </div>
    </div>
  );
}
