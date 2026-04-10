"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Trash2, GripHorizontal } from "lucide-react";
import { useLiveEditor } from "@/components/admin/live-editor-context";

export function SortableSection({
  id,
  children,
}: {
  id: string;
  children: React.ReactNode;
}) {
  const { isEditMode, homeContent, setHomeContent } = useLiveEditor();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id,
    data: { 
      type: "SortableSection", 
      sectionId: id 
    } 
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleDelete = () => {
    if (!homeContent) return;
    setHomeContent({
      ...homeContent,
      sections: homeContent.sections.filter((s) => s.id !== id),
    });
  };

  if (!isEditMode) return <>{children}</>;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative transition-opacity ${
        isDragging ? "opacity-40" : "opacity-100"
      }`}
    >
      <div className="absolute inset-0 z-30 border-2 border-transparent border-dashed hover:border-forest/30 pointer-events-none transition-colors" />
      
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-40 flex items-center gap-1 opacity-0 group-hover:opacity-100 bg-white shadow-xl rounded-full px-2 py-1 border border-sage-light transition-opacity">
        <button
          type="button"
          className="p-1.5 hover:bg-cream rounded-full cursor-grab active:cursor-grabbing text-forest/70"
          {...attributes}
          {...listeners}
        >
          <GripHorizontal className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={handleDelete}
          className="p-1.5 hover:bg-cream rounded-full text-red-500/70 hover:text-red-600"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
      
      {/* We need relative on the child to ensure our overlay sits correctly mostly */}
      <div className="relative z-10 w-full">{children}</div>
    </div>
  );
}
