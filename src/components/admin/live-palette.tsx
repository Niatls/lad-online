"use client";

import { PaletteSection } from "@/components/admin/live-palette/palette-section";
import { LivePaletteSaveFooter } from "@/components/admin/live-palette/save-footer";
import {
  ELEMENT_TEMPLATES,
  STRUCTURE_TEMPLATES,
} from "@/components/admin/live-palette/templates";
import { useLivePaletteSave } from "@/components/admin/live-palette/use-live-palette-save";

export function LivePalette({ onSaved }: { onSaved?: () => void }) {
  const { handleSave, isSaving, saveStatus } = useLivePaletteSave({ onSaved });

  return (
    <div className="flex h-full flex-col bg-white">
      <PaletteSection
        title={"\u0421\u0442\u0440\u0443\u043a\u0442\u0443\u0440\u0430"}
        templates={STRUCTURE_TEMPLATES}
      />
      <PaletteSection
        isScrollable
        title={"\u042d\u043b\u0435\u043c\u0435\u043d\u0442\u044b"}
        templates={ELEMENT_TEMPLATES}
      />
      <LivePaletteSaveFooter
        isSaving={isSaving}
        onSave={handleSave}
        saveStatus={saveStatus}
      />
    </div>
  );
}