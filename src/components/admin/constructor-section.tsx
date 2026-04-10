"use client";

import { useSortable, SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { GripHorizontal, Trash2, ArrowRight, Sparkles, LayoutPanelTop } from "lucide-react";
import { useLiveEditor } from "@/components/admin/live-editor-context";
import { EditableText } from "@/components/admin/editable-text";
import type { PageElement, HomePageSection } from "@/lib/home-sections";

function SortableElement({ sectionId, element }: { sectionId: string; element: PageElement }) {
  const { isEditMode, updateSection, homeContent } = useLiveEditor();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: element.id,
    data: { type: "PageElement", sectionId, element },
  });

  const style = { transform: CSS.Transform.toString(transform), transition };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    const section = homeContent?.sections.find((s) => s.id === sectionId);
    if (!section) return;
    updateSection(sectionId, {
      elements: section.elements?.filter((el) => el.id !== element.id) || [],
    });
  };

  const updateContent = (content: string) => {
    const section = homeContent?.sections.find((s) => s.id === sectionId);
    if (!section) return;
    updateSection(sectionId, {
      elements: section.elements?.map((el) => (el.id === element.id ? { ...el, content } : el)) || [],
    });
  };

  let node: React.ReactNode = null;
  switch (element.kind) {
    case "badge":
      node = (
        <div className="flex justify-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-sage-light/50 bg-sage-light/20 px-4 py-2 text-sm font-medium text-sage-dark backdrop-blur-sm">
            <Sparkles className="h-4 w-4 text-sage" />
            <EditableText tagName="span" value={element.content} onChange={updateContent} />
          </div>
        </div>
      );
      break;
    case "heading":
      node = (
        <h2 className="text-3xl font-bold leading-tight text-forest sm:text-4xl md:text-5xl mt-6 tracking-tight">
          <EditableText tagName="span" value={element.content} onChange={updateContent} />
        </h2>
      );
      break;
    case "paragraph":
      node = (
        <div className="max-w-2xl mx-auto">
          <EditableText
            tagName="p"
            className="text-lg leading-relaxed text-forest/60 sm:text-xl mt-4"
            value={element.content}
            onChange={updateContent}
          />
        </div>
      );
      break;
    case "button":
      node = (
        <div className="flex justify-center mt-8">
          <button className="inline-flex items-center gap-2 rounded-2xl bg-sage px-8 py-4 text-lg font-bold text-white shadow-xl shadow-sage/20 transition-all hover:bg-forest hover:scale-[1.02] active:scale-95">
            <EditableText tagName="span" value={element.content} onChange={updateContent} />
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      );
      break;
    case "socials":
      node = (
        <div className="mt-12 group/socials relative overflow-hidden rounded-3xl bg-sage/10 p-0.5 shadow-sm max-w-4xl mx-auto w-full border border-sage/20">
           <div className="flex flex-col sm:flex-row items-center justify-between gap-6 rounded-[22px] bg-white/80 px-8 py-6 backdrop-blur-md">
            <div className="text-center sm:text-left">
              <h3 className="text-xl font-bold text-forest mb-1">
                <EditableText tagName="span" value={element.content} onChange={updateContent} />
              </h3>
              <p className="text-sm text-forest/60">Telegram, WhatsApp, VK, Discord — выберите свой вариант</p>
            </div>
            <div className="flex flex-wrap justify-center gap-4">
              {[
                { label: "TG", color: "bg-[#24A1DE]" },
                { label: "WA", color: "bg-[#25D366]" },
                { label: "VK", color: "bg-[#0077FF]" },
                { label: "DS", color: "bg-[#5865F2]" }
              ].map((s) => (
                 <div key={s.label} className={`flex h-12 w-12 items-center justify-center rounded-2xl ${s.color} text-white shadow-lg transition hover:scale-110 active:scale-95 cursor-pointer`}>
                   <span className="text-xs font-bold uppercase">{s.label}</span>
                 </div>
               ))}
            </div>
           </div>
        </div>
      );
      break;
    default:
      return null;
  }

  if (!isEditMode) return node;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative w-full group element-wrapper group py-2 ${
        isDragging ? "opacity-30" : "opacity-100"
      }`}
    >
      <div className="absolute -left-8 top-1/2 -translate-y-1/2 z-50 flex flex-col items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          type="button"
          className="p-1 hover:bg-sage-light/20 rounded cursor-grab text-forest/40 active:cursor-grabbing"
          {...attributes}
          {...listeners}
        >
          <GripHorizontal className="h-4 w-4 rotate-90" />
        </button>
        <button type="button" onClick={handleDelete} className="p-1 hover:bg-red-50 rounded text-red-500/40 hover:text-red-500">
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
      <div className="border-2 border-transparent hover:border-sage-light/30 rounded-xl transition-colors">
        {node}
      </div>
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
      sectionId: section.id 
    },
  });

  return (
    <section className="relative w-full py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <SortableContext items={elements.map((e) => e.id)} strategy={verticalListSortingStrategy}>
          <div 
            ref={setNodeRef}
            className={`flex flex-col w-full min-h-[100px] gap-2 ${
              isEditMode && elements.length === 0
                ? "border-2 border-dashed border-sage/30 bg-sage/5 items-center justify-center p-12 rounded-[2rem]"
                : ""
            }`}
          >
            {elements.length === 0 && isEditMode && (
               <div className="text-center">
                 <LayoutPanelTop className="h-8 w-8 text-sage/30 mx-auto mb-2" />
                 <p className="text-forest/30 font-medium">Это пустой блок. Перетащите сюда элементы (текст, кнопки) из боковой панели.</p>
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
