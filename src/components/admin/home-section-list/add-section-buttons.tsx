import { createCustomHomeSection, type HomePageSection } from "@/lib/home-sections";

import { customHomeSectionTemplates } from "./templates";

type AddSectionButtonsProps = {
  onAddSection: (section: HomePageSection) => void;
};

export function AddSectionButtons({ onAddSection }: AddSectionButtonsProps) {
  return (
    <div className="grid gap-2">
      {customHomeSectionTemplates.map((template) => (
        <button
          key={template.label}
          type="button"
          onClick={() => onAddSection(createCustomHomeSection(template.variant))}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-cream px-4 py-3 text-sm font-semibold text-forest transition hover:bg-sage-light/20"
        >
          <template.icon className="h-4 w-4" />
          {template.label}
        </button>
      ))}
    </div>
  );
}
