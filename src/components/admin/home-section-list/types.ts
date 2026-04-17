import type { HomePageSection } from "@/lib/home-sections";

export type HomeSectionMoveDirection = "up" | "down";

export type HomeSectionListProps = {
  onAddSection: (section: HomePageSection) => void;
  onDeleteSection: (id: string) => void;
  onMoveSection: (id: string, direction: HomeSectionMoveDirection) => void;
  onReorderSections: (fromId: string, toId: string) => void;
  onSelectSection: (id: string) => void;
  onToggleSection: (id: string) => void;
  sections: HomePageSection[];
  selectedSectionId: string | null;
};
