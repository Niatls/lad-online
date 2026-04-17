import { X } from "lucide-react";

import { LivePalette } from "@/components/admin/live-palette";

type LiveEditorSidebarProps = {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
};

export function LiveEditorSidebar({
  isOpen,
  onClose,
  onSaved,
}: LiveEditorSidebarProps) {
  return (
    <aside
      className={`fixed right-0 top-0 z-50 h-screen w-80 transform border-l border-sage-light/30 bg-white shadow-2xl transition-transform duration-300 ease-in-out ${
        isOpen ? "translate-x-0" : "translate-x-full"
      }`}
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute -left-12 top-4 rounded-full bg-white p-2 shadow-md hover:bg-cream"
      >
        <X className="h-5 w-5 text-forest" />
      </button>
      <LivePalette onSaved={onSaved} />
    </aside>
  );
}
