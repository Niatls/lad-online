import type { HomePageContent } from "@/lib/content";
import type { HomePageSection } from "@/lib/home-sections";

export type SetHomeField = <K extends keyof HomePageContent>(
  key: K,
  value: HomePageContent[K]
) => void;

export type UpdateHomeSection = (
  id: string,
  updater: (section: HomePageSection) => HomePageSection
) => void;

export type HomeSectionEditorFieldsProps = {
  homeForm: HomePageContent;
  setHomeField: SetHomeField;
};

export type CustomSectionEditorProps = {
  section: HomePageSection;
  updateSection: UpdateHomeSection;
};
