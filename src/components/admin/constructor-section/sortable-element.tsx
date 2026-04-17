"use client";

import { useCallback, useRef } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import {
  GRID_COLS,
  LINK_PLACEHOLDER,
  RESIZE_BOTTOM_TITLE,
  RESIZE_LEFT_TITLE,
  RESIZE_RIGHT_TITLE,
} from "@/components/admin/constructor-section/constants";
import { ConstructorElementContent } from "@/components/admin/constructor-section/element-content";
import { ConstructorElementToolbar } from "@/components/admin/constructor-section/element-toolbar";
import { ConstructorResizeHandles } from "@/components/admin/constructor-section/resize-handles";
import { useLiveEditor } from "@/components/admin/live-editor-context";
import type { PageElement } from "@/lib/home-sections";

type SortableElementProps = {
  sectionId: string;
  element: PageElement;
};

export function SortableElement({ sectionId, element }: SortableElementProps) {
  const { isEditMode, updateSection, homeContent } = useLiveEditor();
  const { setNodeRef, transform, transition, isDragging } = useSortable({
    id: element.id,
    data: { type: "PageElement", sectionId, element },
  });
  const resizeRef = useRef<{ startX: number; startSpan: number } | null>(null);
  const moveRef = useRef<{ startX: number; startCol: number } | null>(null);
  const resizeVRef = useRef<{ startY: number; startRows: number } | null>(null);

  const colStart = element.colStart || 1;
  const colSpan = element.colSpan || GRID_COLS;
  const rowSpan = element.rowSpan || 1;

  const updateElement = useCallback(
    (updates: Partial<PageElement>) => {
      const section = homeContent?.sections.find((entry) => entry.id === sectionId);
      if (!section) return;
      updateSection(sectionId, {
        elements:
          section.elements?.map((entry) =>
            entry.id === element.id ? { ...entry, ...updates } : entry
          ) || [],
      });
    },
    [element.id, homeContent, sectionId, updateSection]
  );

  const handleDelete = (event: React.MouseEvent) => {
    event.stopPropagation();
    const section = homeContent?.sections.find((entry) => entry.id === sectionId);
    if (!section) return;
    updateSection(sectionId, {
      elements: section.elements?.filter((entry) => entry.id !== element.id) || [],
    });
  };

  const adjustColStart = (delta: number) => {
    const newStart = Math.max(1, Math.min(GRID_COLS - colSpan + 1, colStart + delta));
    updateElement({ colStart: newStart });
  };

  const adjustColSpan = (delta: number) => {
    const newSpan = Math.max(1, Math.min(GRID_COLS - colStart + 1, colSpan + delta));
    updateElement({ colSpan: newSpan });
  };

  const handleResizeStart = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    resizeRef.current = { startX: event.clientX, startSpan: colSpan };

    const onMove = (moveEvent: MouseEvent) => {
      if (!resizeRef.current) return;
      const gridContainer = (event.target as HTMLElement).closest("[data-grid-container]");
      if (!gridContainer) return;
      const cellWidth = gridContainer.clientWidth / GRID_COLS;
      const dx = moveEvent.clientX - resizeRef.current.startX;
      const deltaCols = Math.round(dx / cellWidth);
      const newSpan = Math.max(
        1,
        Math.min(GRID_COLS - colStart + 1, resizeRef.current.startSpan + deltaCols)
      );
      updateElement({ colSpan: newSpan });
    };

    const onUp = () => {
      resizeRef.current = null;
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  const handleMoveStart = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    moveRef.current = { startX: event.clientX, startCol: colStart };

    const onMove = (moveEvent: MouseEvent) => {
      if (!moveRef.current) return;
      const gridContainer = (event.target as HTMLElement).closest("[data-grid-container]");
      if (!gridContainer) return;
      const cellWidth = gridContainer.clientWidth / GRID_COLS;
      const dx = moveEvent.clientX - moveRef.current.startX;
      const deltaCols = Math.round(dx / cellWidth);
      const newStart = Math.max(
        1,
        Math.min(GRID_COLS - colSpan + 1, moveRef.current.startCol + deltaCols)
      );
      updateElement({ colStart: newStart });
    };

    const onUp = () => {
      moveRef.current = null;
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  const handleResizeLeftStart = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    const startX = event.clientX;
    const startCol = colStart;
    const startSpan = colSpan;

    const onMove = (moveEvent: MouseEvent) => {
      const gridContainer = (event.target as HTMLElement).closest("[data-grid-container]");
      if (!gridContainer) return;
      const cellWidth = gridContainer.clientWidth / GRID_COLS;
      const dx = moveEvent.clientX - startX;
      const deltaCols = Math.round(dx / cellWidth);
      const newStart = Math.max(1, Math.min(startCol + startSpan - 1, startCol + deltaCols));
      const newSpan = startSpan - (newStart - startCol);
      if (newSpan >= 1) {
        updateElement({ colStart: newStart, colSpan: newSpan });
      }
    };

    const onUp = () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  const handleResizeBottomStart = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    resizeVRef.current = { startY: event.clientY, startRows: rowSpan };
    const rowHeight = 60;

    const onMove = (moveEvent: MouseEvent) => {
      if (!resizeVRef.current) return;
      const dy = moveEvent.clientY - resizeVRef.current.startY;
      const deltaRows = Math.round(dy / rowHeight);
      const newRows = Math.max(1, Math.min(12, resizeVRef.current.startRows + deltaRows));
      updateElement({ rowSpan: newRows });
    };

    const onUp = () => {
      resizeVRef.current = null;
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  const node = (
    <ConstructorElementContent
      element={element}
      isEditMode={isEditMode}
      onUpdateContent={(content) => updateElement({ content })}
      onUpdateTarget={(target) => updateElement({ target })}
      linkPlaceholder={LINK_PLACEHOLDER}
    />
  );

  if (!isEditMode) {
    return (
      <div style={{ gridColumn: `${colStart} / span ${colSpan}`, gridRow: `span ${rowSpan}` }}>
        {node}
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        gridColumn: `${colStart} / span ${colSpan}`,
        gridRow: `span ${rowSpan}`,
      }}
      className={`relative min-h-[48px] group/el ${isDragging ? "opacity-30" : "opacity-100"}`}
    >
      <ConstructorElementToolbar
        colStart={colStart}
        colSpan={colSpan}
        gridCols={GRID_COLS}
        onMoveStart={handleMoveStart}
        onAdjustColStart={adjustColStart}
        onAdjustColSpan={adjustColSpan}
        onDelete={handleDelete}
      />

      <div className="h-full rounded-xl border-2 border-dashed border-transparent transition-colors hover:border-sage/20">
        {node}
      </div>

      <ConstructorResizeHandles
        onResizeLeftStart={handleResizeLeftStart}
        onResizeRightStart={handleResizeStart}
        onResizeBottomStart={handleResizeBottomStart}
        resizeLeftTitle={RESIZE_LEFT_TITLE}
        resizeRightTitle={RESIZE_RIGHT_TITLE}
        resizeBottomTitle={RESIZE_BOTTOM_TITLE}
      />
    </div>
  );
}
