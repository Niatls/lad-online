"use client";

import { useState } from "react";
import { ListChecks, Plus } from "lucide-react";

import { EditorAccordionSection } from "@/components/admin/editor-accordion-section";
import { Field, MarkdownTextareaField } from "@/components/admin/editor-shared";
import { ActionButton, ItemCard } from "@/components/admin/home-content-cards";
import { reorderItems } from "@/components/admin/sort-utils";
import type { HomePageContent, HomeServiceItem } from "@/lib/content";

import { DraggableHint } from "./draggable-hint";
import type { SetHomeField } from "./types";

type ServicesSettingsSectionProps = {
  homeForm: HomePageContent;
  setHomeField: SetHomeField;
};

export function ServicesSettingsSection({
  homeForm,
  setHomeField,
}: ServicesSettingsSectionProps) {
  const [draggingServiceIndex, setDraggingServiceIndex] = useState<number | null>(
    null
  );

  const updateService = (
    index: number,
    key: keyof HomeServiceItem,
    value: string
  ) => {
    setHomeField(
      "services",
      homeForm.services.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [key]: value } : item
      )
    );
  };

  return (
    <EditorAccordionSection
      value="services"
      title={"\u0423\u0441\u043b\u0443\u0433\u0438"}
      description={
        "\u041a\u0430\u0440\u0442\u043e\u0447\u043a\u0438 \u0443\u0441\u043b\u0443\u0433 \u043d\u0430 \u0433\u043b\u0430\u0432\u043d\u043e\u0439 \u0441\u0442\u0440\u0430\u043d\u0438\u0446\u0435. \u0418\u0445 \u0442\u043e\u0436\u0435 \u043c\u043e\u0436\u043d\u043e \u043f\u0435\u0440\u0435\u0442\u0430\u0441\u043a\u0438\u0432\u0430\u0442\u044c."
      }
    >
      <div className="mb-4 flex justify-end">
        <ActionButton
          label={"\u0414\u043e\u0431\u0430\u0432\u0438\u0442\u044c \u0443\u0441\u043b\u0443\u0433\u0443"}
          onClick={() =>
            setHomeField("services", [
              ...homeForm.services,
              {
                title: "\u041d\u043e\u0432\u0430\u044f \u0443\u0441\u043b\u0443\u0433\u0430",
                description:
                  "\u041a\u0440\u0430\u0442\u043a\u043e\u0435 \u043e\u043f\u0438\u0441\u0430\u043d\u0438\u0435 \u0443\u0441\u043b\u0443\u0433\u0438.",
              },
            ])
          }
          icon={Plus}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {homeForm.services.map((service, index) => (
          <div
            key={`${service.title}-${index}`}
            draggable
            onDragStart={() => setDraggingServiceIndex(index)}
            onDragEnd={() => setDraggingServiceIndex(null)}
            onDragOver={(event) => event.preventDefault()}
            onDrop={() => {
              if (draggingServiceIndex === null) return;
              setHomeField(
                "services",
                reorderItems(homeForm.services, draggingServiceIndex, index)
              );
              setDraggingServiceIndex(null);
            }}
            className={draggingServiceIndex === index ? "opacity-60" : ""}
          >
            <ItemCard
              title={`${"\u0423\u0441\u043b\u0443\u0433\u0430"} ${index + 1}`}
              icon={ListChecks}
              onRemove={() =>
                setHomeField(
                  "services",
                  homeForm.services.filter((_, itemIndex) => itemIndex !== index)
                )
              }
              disableRemove={homeForm.services.length <= 1}
            >
              <DraggableHint />
              <div className="space-y-4">
                <Field
                  label={"\u041d\u0430\u0437\u0432\u0430\u043d\u0438\u0435 \u0443\u0441\u043b\u0443\u0433\u0438"}
                  value={service.title}
                  onChange={(value) => updateService(index, "title", value)}
                />
                <MarkdownTextareaField
                  label={"\u041e\u043f\u0438\u0441\u0430\u043d\u0438\u0435"}
                  rows={4}
                  value={service.description}
                  onChange={(value) =>
                    updateService(index, "description", value)
                  }
                />
              </div>
            </ItemCard>
          </div>
        ))}
      </div>
    </EditorAccordionSection>
  );
}
