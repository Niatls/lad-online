"use client";

import { useEffect, useMemo, useState } from "react";

import type { HomePageContent } from "@/lib/content";
import type { HomePageSection } from "@/lib/home-sections";

import { HomeSectionEditor } from "./home-section-editor";
import { HomeSectionList } from "./home-section-list";
import { reorderItems } from "./sort-utils";

type HomeContentMainSectionsProps = {
  homeForm: HomePageContent;
  setHomeField: <K extends keyof HomePageContent>(
    key: K,
    value: HomePageContent[K]
  ) => void;
};

export function HomeContentMainSections({
  homeForm,
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
    <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
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
        onReorderSections={(fromId, toId) =>
          updateSections((sections) => {
            const fromIndex = sections.findIndex((section) => section.id === fromId);
            const toIndex = sections.findIndex((section) => section.id === toId);
            return reorderItems(sections, fromIndex, toIndex);
          })
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
  return reorderItems(sections, index, targetIndex);
}
