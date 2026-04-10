"use client";

import { useEffect, useMemo, useState } from "react";

import type { HomePageContent, ManagedContentPage } from "@/lib/content";
import type { HomePageSection } from "@/lib/home-sections";

import { HomePageClient } from "@/components/home/home-page-client";

import { HomeSectionEditor } from "./home-section-editor";
import { HomeSectionList } from "./home-section-list";

type HomeContentMainSectionsProps = {
  homeForm: HomePageContent;
  previewArticles: ManagedContentPage[];
  setHomeField: <K extends keyof HomePageContent>(
    key: K,
    value: HomePageContent[K]
  ) => void;
};

export function HomeContentMainSections({
  homeForm,
  previewArticles,
  setHomeField,
}: HomeContentMainSectionsProps) {
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(
    homeForm.sections[0]?.id ?? null
  );

  useEffect(() => {
    if (!homeForm.sections.some((section) => section.id === selectedSectionId)) {
      setSelectedSectionId(homeForm.sections[0]?.id ?? null);
    }
  }, [homeForm.sections, selectedSectionId]);

  const selectedSection = useMemo(
    () =>
      homeForm.sections.find((section) => section.id === selectedSectionId) ??
      null,
    [homeForm.sections, selectedSectionId]
  );

  const updateSections = (
    updater: (sections: HomePageSection[]) => HomePageSection[]
  ) => {
    setHomeField("sections", updater(homeForm.sections));
  };

  const updateSection = (
    id: string,
    updater: (section: HomePageSection) => HomePageSection
  ) => {
    updateSections((sections) =>
      sections.map((section) => (section.id === id ? updater(section) : section))
    );
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[300px_minmax(0,1fr)_minmax(0,0.9fr)]">
      <HomeSectionList
        onAddSection={(section) => {
          updateSections((sections) => [...sections, section]);
          setSelectedSectionId(section.id);
        }}
        onDeleteSection={(id) => {
          updateSections((sections) =>
            sections.filter((section) => section.id !== id)
          );
        }}
        onMoveSection={(id, direction) =>
          updateSections((sections) => moveSection(sections, id, direction))
        }
        onSelectSection={setSelectedSectionId}
        onToggleSection={(id) =>
          updateSection(id, (section) => ({
            ...section,
            enabled: !section.enabled,
          }))
        }
        sections={homeForm.sections}
        selectedSectionId={selectedSectionId}
      />

      <HomeSectionEditor
        homeForm={homeForm}
        section={selectedSection}
        setHomeField={setHomeField}
        updateSection={updateSection}
      />

      <div className="rounded-[1.5rem] border border-sage-light/20 bg-white p-3">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-forest">Предпросмотр</h3>
          <span className="text-xs text-forest/40">Рядом с редактором</span>
        </div>
        <div className="max-h-[82vh] overflow-auto rounded-2xl border border-sage-light/20 bg-cream">
          <HomePageClient
            articles={previewArticles}
            homeContent={homeForm}
            previewMode
          />
        </div>
      </div>
    </div>
  );
}

function moveSection(
  sections: HomePageSection[],
  id: string,
  direction: "up" | "down"
) {
  const index = sections.findIndex((section) => section.id === id);
  if (index === -1) {
    return sections;
  }

  const targetIndex = direction === "up" ? index - 1 : index + 1;
  if (targetIndex < 0 || targetIndex >= sections.length) {
    return sections;
  }

  const nextSections = [...sections];
  const [section] = nextSections.splice(index, 1);
  nextSections.splice(targetIndex, 0, section);
  return nextSections;
}
