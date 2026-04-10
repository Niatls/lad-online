"use client";

import { useEffect, useState, useId } from "react";
import { useRouter } from "next/navigation";
import {
  DndContext,
  DragEndEvent,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates, arrayMove } from "@dnd-kit/sortable";
import { Pencil, X } from "lucide-react";

import { LivePalette } from "@/components/admin/live-palette";
import { LiveEditorProvider, useLiveEditor } from "@/components/admin/live-editor-context";
import type { HomePageContent, ManagedContentPage } from "@/lib/content";

function LiveEditorInner({ children, onSaved }: { children: React.ReactNode; onSaved: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const id = useId();
  const { homeContent, setHomeContent } = useLiveEditor();

  useEffect(() => {
    setMounted(true);
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const customCollisionDetection = (args: any) => {
    // 1. Find if we're dragging a Section or an Element
    const activeData = args.active.data.current;
    
    const isElement = activeData?.type === "PageElement" || 
                     (args.active.id.toString().startsWith("palette-") && activeData?.template?.isElement);

    if (isElement) {
      // For elements, prioritize PageElements and ConstructorSections
      const elementContainers = args.droppableContainers.filter((c: any) => 
        c.data.current?.type === "PageElement" || c.data.current?.type === "ConstructorSection"
      );
      return closestCorners({ ...args, droppableContainers: elementContainers });
    }

    // For sections, only consider SortableSections
    const sectionContainers = args.droppableContainers.filter((c: any) => 
      c.data.current?.type === "SortableSection" && !c.id.toString().startsWith("palette-")
    );
    return closestCorners({ ...args, droppableContainers: sectionContainers });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || !homeContent) return;

    const activeData = active.data.current;
    const overData = over.data.current;

    // --- CASE 1: Dragging from Palette ---
    if (active.id.toString().startsWith("palette-")) {
      const template = activeData?.template;
      if (!template) return;

      if (template.isElement) {
        // Find which section to put it in
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
          sections: homeContent.sections.map((s) => {
            if (s.id === sectionId) {
              return {
                ...s,
                kind: s.kind === "constructor" ? "constructor" : s.kind,
                elements: [...(s.elements || []), newElement],
              };
            }
            return s;
          }),
        });
      } else {
        // Dragging a section
        const newSection = {
          id: `sec-${Date.now()}`,
          kind: template.kind,
          variant: template.variant,
          title: template.title,
          enabled: true,
          elements: template.kind === "constructor" ? [] : undefined,
        } as any;

        const overIndex = homeContent.sections.findIndex((s) => s.id === over.id);
        const targetIndex = overIndex === -1 ? homeContent.sections.length : overIndex;

        setHomeContent({
          ...homeContent,
          sections: [
            ...homeContent.sections.slice(0, targetIndex),
            newSection,
            ...homeContent.sections.slice(targetIndex),
          ],
        });
      }
      return;
    }

    // --- CASE 2: Reordering existing Elements ---
    if (activeData?.type === "PageElement") {
      const activeSectionId = activeData.sectionId;
      const overSectionId = overData?.sectionId;

      if (!overSectionId || activeSectionId !== overSectionId) return;

      const sectionIndex = homeContent.sections.findIndex(s => s.id === activeSectionId);
      const section = homeContent.sections[sectionIndex];
      if (!section.elements) return;

      const oldIdx = section.elements.findIndex(el => el.id === active.id);
      const newIdx = section.elements.findIndex(el => el.id === over.id);

      if (oldIdx !== -1 && newIdx !== -1 && oldIdx !== newIdx) {
        const newElements = arrayMove(section.elements, oldIdx, newIdx);
        const newSections = [...homeContent.sections];
        newSections[sectionIndex] = { ...section, elements: newElements };
        setHomeContent({ ...homeContent, sections: newSections });
      }
      return;
    }

    // --- CASE 3: Reordering Sections ---
    if (activeData?.type === "SortableSection") {
      const oldIndex = homeContent.sections.findIndex((s) => s.id === active.id);
      const newIndex = homeContent.sections.findIndex((s) => s.id === over.id);

      if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
        setHomeContent({
          ...homeContent,
          sections: arrayMove(homeContent.sections, oldIndex, newIndex),
        });
      }
    }
  };

  if (!mounted) {
    return (
      <div className={`transition-all duration-300 ${isOpen ? "pr-80" : ""}`}>
        {children}
      </div>
    );
  }

  return (
    <DndContext id={id} sensors={sensors} collisionDetection={customCollisionDetection} onDragEnd={handleDragEnd}>
      <div className={`transition-all duration-300 ${isOpen ? "pr-80" : ""}`}>
        {children}
      </div>

      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex items-center justify-center gap-2 rounded-full shadow-xl bg-forest p-4 text-white hover:bg-forest/90 hover:scale-105 active:scale-95 transition-all"
        >
          <Pencil className="h-5 w-5" />
          <span className="hidden sm:inline font-medium">Редактировать</span>
        </button>
      )}

      <aside
        className={`fixed top-0 right-0 z-50 h-screen w-80 transform border-l border-sage-light/30 bg-white shadow-2xl transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <button
          onClick={() => setIsOpen(false)}
          className="absolute -left-12 top-4 rounded-full bg-white p-2 shadow-md hover:bg-cream"
        >
          <X className="h-5 w-5 text-forest" />
        </button>
        <LivePalette onSaved={onSaved} />
      </aside>
    </DndContext>
  );
}

export function AdminLiveEditor({
  children,
  homeContent,
}: {
  children: React.ReactNode;
  homeContent: HomePageContent;
  pages: ManagedContentPage[];
}) {
  const router = useRouter();

  return (
    <LiveEditorProvider initialContent={homeContent} isEditMode={true}>
      <LiveEditorInner onSaved={() => router.refresh()}>{children}</LiveEditorInner>
    </LiveEditorProvider>
  );
}
