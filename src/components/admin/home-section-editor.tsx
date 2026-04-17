"use client";

import { AboutSectionEditor } from "@/components/admin/home-section-editor/about-section-editor";
import { BookingSectionEditor } from "@/components/admin/home-section-editor/booking-section-editor";
import { CustomSectionEditor } from "@/components/admin/home-section-editor/custom-section-editor";
import { HomeSectionEditorEmptyState } from "@/components/admin/home-section-editor/empty-state";
import { HeroSectionEditor } from "@/components/admin/home-section-editor/hero-section-editor";
import { TemplateSectionEditor } from "@/components/admin/home-section-editor/template-section-editor";
import type {
  SetHomeField,
  UpdateHomeSection,
} from "@/components/admin/home-section-editor/types";
import type { HomePageContent } from "@/lib/content";
import type { HomePageSection } from "@/lib/home-sections";

type HomeSectionEditorProps = {
  homeForm: HomePageContent;
  section: HomePageSection | null;
  setHomeField: SetHomeField;
  updateSection: UpdateHomeSection;
};

export function HomeSectionEditor({
  homeForm,
  section,
  setHomeField,
  updateSection,
}: HomeSectionEditorProps) {
  if (!section) {
    return <HomeSectionEditorEmptyState />;
  }

  if (section.kind === "hero") {
    return (
      <HeroSectionEditor homeForm={homeForm} setHomeField={setHomeField} />
    );
  }

  if (section.kind === "about") {
    return (
      <AboutSectionEditor homeForm={homeForm} setHomeField={setHomeField} />
    );
  }

  if (section.kind === "booking") {
    return (
      <BookingSectionEditor homeForm={homeForm} setHomeField={setHomeField} />
    );
  }

  if (section.kind === "custom") {
    return (
      <CustomSectionEditor section={section} updateSection={updateSection} />
    );
  }

  return <TemplateSectionEditor section={section} />;
}