"use client";

import {
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";

import { useLiveEditor } from "@/components/admin/live-editor-context";

export function useLiveEditorDnd() {
  const { homeContent, setHomeContent } = useLiveEditor();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || !homeContent) return;

    const activeData = active.data.current;
    const overData = over.data.current;

    if (active.id.toString().startsWith("palette-")) {
      const template = activeData?.template;
      if (!template) return;

      if (template.isElement) {
        const sectionId = overData?.sectionId;
        if (!sectionId) return;

        const newElement = {
          id: `el-${Date.now()}`,
          kind: template.kind,
          content: template.content,
          target: template.target,
          colStart: 1,
          colSpan: template.colSpan || 24,
        };

        setHomeContent({
          ...homeContent,
          sections: homeContent.sections.map((section) => {
            if (section.id !== sectionId) return section;

            return {
              ...section,
              kind: section.kind === "constructor" ? "constructor" : section.kind,
              elements: [...(section.elements || []), newElement],
            };
          }),
        });
        return;
      }

      const newSection = {
        id: `sec-${Date.now()}`,
        kind: template.kind,
        variant: template.variant,
        title: template.title,
        enabled: true,
        elements: template.kind === "constructor" ? [] : undefined,
      } as any;

      const overIndex = homeContent.sections.findIndex(
        (section) => section.id === over.id
      );
      const targetIndex =
        overIndex === -1 ? homeContent.sections.length : overIndex;

      setHomeContent({
        ...homeContent,
        sections: [
          ...homeContent.sections.slice(0, targetIndex),
          newSection,
          ...homeContent.sections.slice(targetIndex),
        ],
      });
      return;
    }

    if (activeData?.type === "PageElement") {
      const activeSectionId = activeData.sectionId;
      const overSectionId = overData?.sectionId;

      if (!overSectionId || activeSectionId !== overSectionId) return;

      const sectionIndex = homeContent.sections.findIndex(
        (section) => section.id === activeSectionId
      );
      const section = homeContent.sections[sectionIndex];
      if (!section.elements) return;

      const oldIndex = section.elements.findIndex(
        (element) => element.id === active.id
      );
      const newIndex = section.elements.findIndex(
        (element) => element.id === over.id
      );

      if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
        const nextElements = arrayMove(section.elements, oldIndex, newIndex);
        const nextSections = [...homeContent.sections];
        nextSections[sectionIndex] = { ...section, elements: nextElements };
        setHomeContent({ ...homeContent, sections: nextSections });
      }
      return;
    }

    if (activeData?.type === "SortableSection") {
      const oldIndex = homeContent.sections.findIndex(
        (section) => section.id === active.id
      );
      const newIndex = homeContent.sections.findIndex(
        (section) => section.id === over.id
      );

      if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
        setHomeContent({
          ...homeContent,
          sections: arrayMove(homeContent.sections, oldIndex, newIndex),
        });
      }
    }
  };

  return {
    handleDragEnd,
    sensors,
  };
}
