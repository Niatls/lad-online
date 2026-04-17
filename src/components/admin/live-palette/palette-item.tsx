"use client";

import { useDraggable } from "@dnd-kit/core";
import { GripVertical } from "lucide-react";

import type { PaletteTemplate } from "./templates";

type PaletteItemProps = {
  template: PaletteTemplate;
};

export function PaletteItem({ template }: PaletteItemProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `palette-${template.id}`,
    data: {
      type: "PaletteItem",
      template,
    },
  });
  const Icon = template.icon;

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
      <Icon className="h-5 w-5 text-forest/70" />
      <span className="text-sm font-medium text-forest">{template.title}</span>
    </div>
  );
}
