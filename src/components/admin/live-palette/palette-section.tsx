import { PaletteItem } from "./palette-item";
import type { PaletteTemplate } from "./templates";

type PaletteSectionProps = {
  isScrollable?: boolean;
  templates: PaletteTemplate[];
  title: string;
};

export function PaletteSection({
  isScrollable,
  templates,
  title,
}: PaletteSectionProps) {
  return (
    <div
      className={`flex flex-col border-b border-sage-light/20 p-4 ${
        isScrollable ? "flex-1 overflow-y-auto" : ""
      }`}
    >
      <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-forest/50">
        {title}
      </h2>
      <div className="space-y-2">
        {templates.map((template) => (
          <PaletteItem key={template.id} template={template} />
        ))}
      </div>
    </div>
  );
}
