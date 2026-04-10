"use client";

import { useRef, useCallback } from "react";
import { useSortable, SortableContext, rectSortingStrategy } from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import {
  GripHorizontal, Trash2, ArrowRight, Sparkles, LayoutPanelTop,
  ChevronLeft, ChevronRight, Minus, Plus, Link2,
} from "lucide-react";
import { useLiveEditor } from "@/components/admin/live-editor-context";
import { EditableText } from "@/components/admin/editable-text";
import type { PageElement, HomePageSection } from "@/lib/home-sections";

const GRID_COLS = 24;

function SortableElement({ sectionId, element }: { sectionId: string; element: PageElement }) {
  const { isEditMode, updateSection, homeContent } = useLiveEditor();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: element.id,
    data: { type: "PageElement", sectionId, element },
  });
  const resizeRef = useRef<{ startX: number; startSpan: number } | null>(null);
  const moveRef = useRef<{ startX: number; startCol: number } | null>(null);
  const resizeVRef = useRef<{ startY: number; startRows: number } | null>(null);

  const colStart = element.colStart || 1;
  const colSpan = element.colSpan || GRID_COLS;
  const rowSpan = element.rowSpan || 1;

  const style = { transform: CSS.Transform.toString(transform), transition };

  const updateElement = useCallback((updates: Partial<PageElement>) => {
    const section = homeContent?.sections.find((s) => s.id === sectionId);
    if (!section) return;
    updateSection(sectionId, {
      elements: section.elements?.map((el) =>
        el.id === element.id ? { ...el, ...updates } : el
      ) || [],
    });
  }, [homeContent, sectionId, element.id, updateSection]);

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    const section = homeContent?.sections.find((s) => s.id === sectionId);
    if (!section) return;
    updateSection(sectionId, {
      elements: section.elements?.filter((el) => el.id !== element.id) || [],
    });
  };

  const updateContent = (content: string) => {
    updateElement({ content });
  };

  const adjustColStart = (delta: number) => {
    const newStart = Math.max(1, Math.min(GRID_COLS - colSpan + 1, colStart + delta));
    updateElement({ colStart: newStart });
  };

  const adjustColSpan = (delta: number) => {
    const newSpan = Math.max(1, Math.min(GRID_COLS - colStart + 1, colSpan + delta));
    updateElement({ colSpan: newSpan });
  };

  const adjustRowSpan = (delta: number) => {
    const newRows = Math.max(1, Math.min(12, rowSpan + delta));
    updateElement({ rowSpan: newRows });
  };

  // --- Right-edge resize via mouse drag ---
  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    resizeRef.current = { startX: e.clientX, startSpan: colSpan };

    const onMove = (moveEvent: MouseEvent) => {
      if (!resizeRef.current) return;
      const gridContainer = (e.target as HTMLElement).closest("[data-grid-container]");
      if (!gridContainer) return;
      const cellWidth = gridContainer.clientWidth / GRID_COLS;
      const dx = moveEvent.clientX - resizeRef.current.startX;
      const deltaCols = Math.round(dx / cellWidth);
      const newSpan = Math.max(1, Math.min(GRID_COLS - colStart + 1, resizeRef.current.startSpan + deltaCols));
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

  // --- Move element via mouse drag ---
  const handleMoveStart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    moveRef.current = { startX: e.clientX, startCol: colStart };

    const onMove = (moveEvent: MouseEvent) => {
      if (!moveRef.current) return;
      const gridContainer = (e.target as HTMLElement).closest("[data-grid-container]");
      if (!gridContainer) return;
      const cellWidth = gridContainer.clientWidth / GRID_COLS;
      const dx = moveEvent.clientX - moveRef.current.startX;
      const deltaCols = Math.round(dx / cellWidth);
      const newStart = Math.max(1, Math.min(GRID_COLS - colSpan + 1, moveRef.current.startCol + deltaCols));
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

  // --- Left-edge resize via mouse drag (adjusts start + span) ---
  const handleResizeLeftStart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX;
    const startCol = colStart;
    const startSpan = colSpan;

    const onMove = (moveEvent: MouseEvent) => {
      const gridContainer = (e.target as HTMLElement).closest("[data-grid-container]");
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

  // --- Bottom-edge resize via mouse drag ---
  const handleResizeBottomStart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    resizeVRef.current = { startY: e.clientY, startRows: rowSpan };
    const ROW_HEIGHT = 60;

    const onMove = (moveEvent: MouseEvent) => {
      if (!resizeVRef.current) return;
      const dy = moveEvent.clientY - resizeVRef.current.startY;
      const deltaRows = Math.round(dy / ROW_HEIGHT);
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

  let node: React.ReactNode = null;
  switch (element.kind) {
    case "badge":
      node = (
        <div className="flex justify-center py-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-sage-light/50 bg-sage-light/20 px-4 py-2 text-sm font-medium text-sage-dark backdrop-blur-sm">
            <Sparkles className="h-4 w-4 text-sage" />
            <EditableText tagName="span" value={element.content} onChange={updateContent} />
          </div>
        </div>
      );
      break;
    case "heading":
      node = (
        <h2 className="text-3xl font-bold leading-tight text-forest sm:text-4xl md:text-5xl py-4 tracking-tight">
          <EditableText tagName="span" value={element.content} onChange={updateContent} />
        </h2>
      );
      break;
    case "paragraph":
      node = (
        <div className="w-full py-2">
          <EditableText
            tagName="p"
            className="text-lg leading-relaxed text-forest/60 sm:text-xl"
            value={element.content}
            onChange={updateContent}
          />
        </div>
      );
      break;
    case "button":
      node = (
        <div className="flex flex-col items-center justify-center py-4 h-full">
          <button className="inline-flex items-center gap-2 rounded-2xl bg-sage px-8 py-4 text-lg font-bold text-white shadow-xl shadow-sage/20 transition-all hover:bg-forest hover:scale-[1.02] active:scale-95">
            <EditableText tagName="span" value={element.content} onChange={updateContent} />
            <ArrowRight className="h-5 w-5" />
          </button>
          {isEditMode && (
            <div className="mt-2 flex items-center gap-1.5 text-xs text-forest/40">
              <Link2 className="h-3 w-3" />
              <EditableText
                tagName="span"
                className="font-mono text-[11px] text-forest/50 bg-sage-light/10 px-1.5 py-0.5 rounded border border-sage-light/20 min-w-[60px]"
                value={element.target || ""}
                onChange={(target: string) => updateElement({ target })}
                placeholder="ссылка"
              />
            </div>
          )}
        </div>
      );
      break;
    case "socials":
      node = (
        <div className="py-4 w-full">
          <div className="relative overflow-hidden rounded-3xl bg-sage/10 p-0.5 shadow-sm w-full border border-sage/20">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 rounded-[22px] bg-white/80 px-8 py-6 backdrop-blur-md">
              <div className="text-center sm:text-left">
                <h3 className="text-xl font-bold text-forest mb-1">
                  <EditableText tagName="span" value={element.content} onChange={updateContent} />
                </h3>
                <p className="text-sm text-forest/60">Telegram, WhatsApp, VK, Discord</p>
              </div>
              <div className="flex flex-wrap justify-center gap-3">
                {[
                  { label: "TG", color: "bg-[#24A1DE]" },
                  { label: "WA", color: "bg-[#25D366]" },
                  { label: "VK", color: "bg-[#0077FF]" },
                  { label: "DS", color: "bg-[#5865F2]" },
                ].map((s) => (
                  <div key={s.label} className={`flex h-11 w-11 items-center justify-center rounded-2xl ${s.color} text-white shadow-lg transition hover:scale-110`}>
                    <span className="text-xs font-bold">{s.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      );
      break;
    default:
      return null;
  }

  // Non-edit mode: render in grid cell
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
        ...style,
        gridColumn: `${colStart} / span ${colSpan}`,
        gridRow: `span ${rowSpan}`,
      }}
      className={`relative group/el min-h-[48px] ${isDragging ? "opacity-30" : "opacity-100"}`}
    >
      {/* Toolbar */}
      <div className="absolute -top-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-0.5 opacity-0 group-hover/el:opacity-100 transition-opacity bg-white/95 shadow-lg rounded-full px-1 py-0.5 border border-sage-light/40 backdrop-blur-sm whitespace-nowrap">
        {/* Move handle — drag to reposition in grid */}
        <button
          type="button"
          className="p-1 hover:bg-sage-light/20 rounded-full cursor-move text-forest/50"
          onMouseDown={handleMoveStart}
        >
          <GripHorizontal className="h-3 w-3" />
        </button>

        <div className="w-px h-3 bg-sage-light/30" />

        {/* Position: move left/right */}
        <button type="button" onClick={() => adjustColStart(-1)} disabled={colStart <= 1}
          className="p-0.5 hover:bg-sage-light/20 rounded text-forest/50 disabled:opacity-20">
          <ChevronLeft className="h-3 w-3" />
        </button>
        <span className="text-[9px] font-mono text-forest/40 min-w-[18px] text-center select-none">{colStart}</span>
        <button type="button" onClick={() => adjustColStart(1)} disabled={colStart + colSpan > GRID_COLS}
          className="p-0.5 hover:bg-sage-light/20 rounded text-forest/50 disabled:opacity-20">
          <ChevronRight className="h-3 w-3" />
        </button>

        <div className="w-px h-3 bg-sage-light/30" />

        {/* Width: shrink/grow */}
        <button type="button" onClick={() => adjustColSpan(-1)} disabled={colSpan <= 1}
          className="p-0.5 hover:bg-sage-light/20 rounded text-forest/50 disabled:opacity-20">
          <Minus className="h-3 w-3" />
        </button>
        <span className="text-[9px] font-mono text-forest/40 min-w-[18px] text-center select-none">{colSpan}</span>
        <button type="button" onClick={() => adjustColSpan(1)} disabled={colStart + colSpan > GRID_COLS}
          className="p-0.5 hover:bg-sage-light/20 rounded text-forest/50 disabled:opacity-20">
          <Plus className="h-3 w-3" />
        </button>

        <div className="w-px h-3 bg-sage-light/30" />

        {/* Delete */}
        <button type="button" onClick={handleDelete} className="p-1 hover:bg-red-50 rounded-full text-red-400 hover:text-red-500">
          <Trash2 className="h-3 w-3" />
        </button>
      </div>

      {/* Content with hover border */}
      <div className="border-2 border-dashed border-transparent hover:border-sage/20 rounded-xl transition-colors h-full">
        {node}
      </div>

      {/* Left resize handle */}
      <div
        onMouseDown={handleResizeLeftStart}
        className="absolute top-0 -left-1 w-2 h-full cursor-col-resize z-40 group-hover/el:bg-sage/20 rounded-l-xl transition-colors"
        title="Потяните для изменения начала"
      />

      {/* Right resize handle */}
      <div
        onMouseDown={handleResizeStart}
        className="absolute top-0 -right-1 w-2 h-full cursor-col-resize z-40 group-hover/el:bg-sage/20 rounded-r-xl transition-colors"
        title="Потяните для изменения ширины"
      />

      {/* Bottom resize handle */}
      <div
        onMouseDown={handleResizeBottomStart}
        className="absolute -bottom-1 left-0 h-2 w-full cursor-row-resize z-40 group-hover/el:bg-sage/20 rounded-b-xl transition-colors"
        title="Потяните для изменения высоты"
      />
    </div>
  );
}

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
    <section className="relative w-full py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <SortableContext items={elements.map((e) => e.id)} strategy={rectSortingStrategy}>
          <div
            ref={setNodeRef}
            data-grid-container
            className={`grid w-full min-h-[80px] gap-y-2 ${
              isEditMode && elements.length === 0
                ? "border-2 border-dashed border-sage/30 bg-sage/5 place-items-center p-12 rounded-[2rem]"
                : ""
            }`}
            style={{
              gridTemplateColumns: `repeat(${GRID_COLS}, 1fr)`,
              gridAutoRows: "minmax(60px, auto)",
              ...(isEditMode ? {
                backgroundImage: `repeating-linear-gradient(90deg, transparent, transparent calc(${100/GRID_COLS}% - 1px), rgba(139,163,139,0.1) calc(${100/GRID_COLS}% - 1px), rgba(139,163,139,0.1) ${100/GRID_COLS}%)`,
                backgroundSize: "100% 100%",
              } : {}),
            }}
          >
            {elements.length === 0 && isEditMode && (
              <div className="text-center" style={{ gridColumn: `1 / span ${GRID_COLS}` }}>
                <LayoutPanelTop className="h-8 w-8 text-sage/30 mx-auto mb-2" />
                <p className="text-forest/30 font-medium text-sm">Перетащите сюда элементы из боковой панели</p>
              </div>
            )}
            {elements.map((el) => (
              <SortableElement key={el.id} sectionId={section.id} element={el} />
            ))}
          </div>
        </SortableContext>
      </div>
    </section>
  );
}
