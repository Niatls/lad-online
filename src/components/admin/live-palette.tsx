"use client";

import { useDraggable } from "@dnd-kit/core";
import { LayoutPanelTop, Type, GripVertical, CheckCircle, Loader2, Sparkles, AlignLeft, MousePointerClick, MessageCircle } from "lucide-react";
import { useState } from "react";

import { useLiveEditor } from "@/components/admin/live-editor-context";

const STRUCTURE_TEMPLATES = [
  { id: "constructor", title: "Пустой блок", icon: LayoutPanelTop, kind: "constructor", isElement: false },
];

const ELEMENT_TEMPLATES = [
  { id: "badge", title: "Плашка", icon: Sparkles, kind: "badge", isElement: true, content: "Новая плашка", colSpan: 24 },
  { id: "heading", title: "Заголовок", icon: Type, kind: "heading", isElement: true, content: "Заголовок", colSpan: 24 },
  { id: "paragraph", title: "Текст", icon: AlignLeft, kind: "paragraph", isElement: true, content: "Обычный текст", colSpan: 24 },
  { id: "button", title: "Кнопка", icon: MousePointerClick, kind: "button", isElement: true, content: "Кнопка", target: "booking", colSpan: 8 },
  { id: "socials", title: "Облако соцсетей", icon: MessageCircle, kind: "socials", isElement: true, content: "Свяжитесь с нами", colSpan: 24 },
];

function PaletteItem({ template }: { template: any }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `palette-${template.id}`,
    data: {
      type: "PaletteItem",
      template,
    },
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`flex cursor-grab items-center gap-3 rounded-lg border border-sage-light/30 bg-white p-3 shadow-sm transition-all hover:border-sage hover:shadow-md active:cursor-grabbing ${
        isDragging ? "opacity-50" : "opacity-100"
      }`}
    >
      <GripVertical className="h-4 w-4 text-forest/40" />
      <template.icon className="h-5 w-5 text-forest/70" />
      <span className="text-sm font-medium text-forest">{template.title}</span>
    </div>
  );
}

export function LivePalette({ onSaved }: { onSaved?: () => void }) {
  const { homeContent } = useLiveEditor();
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");

  const handleSave = async () => {
    if (!homeContent) return;
    setIsSaving(true);
    setSaveStatus("idle");
    try {
      const response = await fetch("/api/admin/content/home", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(homeContent),
      });
      if (response.ok) {
        setSaveStatus("success");
        setTimeout(() => setSaveStatus("idle"), 3000);
        onSaved?.();
      } else {
        setSaveStatus("error");
      }
    } catch {
      setSaveStatus("error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex h-full flex-col bg-white">
      <div className="flex flex-col p-4 border-b border-sage-light/20">
        <h2 className="text-xs font-bold uppercase tracking-wider text-forest/50 mb-3">Структура</h2>
        <div className="space-y-2">
          {STRUCTURE_TEMPLATES.map((tpl) => (
            <PaletteItem key={tpl.id} template={tpl} />
          ))}
        </div>
      </div>
      
      <div className="flex flex-col p-4 border-b border-sage-light/20 flex-1 overflow-y-auto">
        <h2 className="text-xs font-bold uppercase tracking-wider text-forest/50 mb-3">Элементы</h2>
        <div className="space-y-2">
          {ELEMENT_TEMPLATES.map((tpl) => (
            <PaletteItem key={tpl.id} template={tpl} />
          ))}
        </div>
      </div>

      <div className="mt-auto p-4 border-t border-sage-light/20 bg-cream/30">
        <p className="text-xs text-forest/60 mb-4 leading-relaxed">
          Перетащите Пустой блок на страницу. Затем перетаскивайте в него Элементы!
        </p>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-forest px-4 py-3 text-sm font-semibold text-white transition hover:bg-forest/90 disabled:opacity-50"
        >
          {isSaving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : saveStatus === "success" ? (
            <>
              <CheckCircle className="h-4 w-4" />
              Сохранено
            </>
          ) : (
            "Опубликовать"
          )}
        </button>
        {saveStatus === "error" && (
          <p className="mt-2 text-xs text-red-500 text-center font-medium">Ошибка сохранения</p>
        )}
      </div>
    </div>
  );
}
