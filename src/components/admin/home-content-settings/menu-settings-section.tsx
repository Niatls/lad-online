"use client";

import { useState } from "react";
import { Grip, Plus } from "lucide-react";

import { EditorAccordionSection } from "@/components/admin/editor-accordion-section";
import { Field } from "@/components/admin/editor-shared";
import { menuTargets } from "@/components/admin/editor-types";
import { ActionButton, ItemCard } from "@/components/admin/home-content-cards";
import { reorderItems } from "@/components/admin/sort-utils";
import type { HomeNavLink, HomePageContent } from "@/lib/content";

import { DraggableHint } from "./draggable-hint";
import type { SetHomeField } from "./types";

type MenuSettingsSectionProps = {
  homeForm: HomePageContent;
  setHomeField: SetHomeField;
};

export function MenuSettingsSection({
  homeForm,
  setHomeField,
}: MenuSettingsSectionProps) {
  const [draggingMenuIndex, setDraggingMenuIndex] = useState<number | null>(null);

  const updateNavLink = (
    index: number,
    key: keyof HomeNavLink,
    value: string
  ) => {
    setHomeField(
      "navLinks",
      homeForm.navLinks.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [key]: value } : item
      )
    );
  };

  return (
    <EditorAccordionSection
      value="menu"
      title={"\u041c\u0435\u043d\u044e"}
      description={
        "\u041f\u0443\u043d\u043a\u0442\u044b \u043d\u0430\u0432\u0438\u0433\u0430\u0446\u0438\u0438 \u0432 \u0448\u0430\u043f\u043a\u0435 \u0441\u0430\u0439\u0442\u0430. \u0418\u0445 \u043c\u043e\u0436\u043d\u043e \u043f\u0435\u0440\u0435\u0442\u0430\u0441\u043a\u0438\u0432\u0430\u0442\u044c."
      }
    >
      <div className="mb-4 flex justify-end">
        <ActionButton
          label={"\u0414\u043e\u0431\u0430\u0432\u0438\u0442\u044c"}
          onClick={() =>
            setHomeField("navLinks", [
              ...homeForm.navLinks,
              {
                label: "\u041d\u043e\u0432\u044b\u0439 \u043f\u0443\u043d\u043a\u0442",
                target: "about",
              },
            ])
          }
          icon={Plus}
        />
      </div>

      <div className="space-y-3">
        {homeForm.navLinks.map((item, index) => (
          <div
            key={`${item.target}-${index}`}
            draggable
            onDragStart={() => setDraggingMenuIndex(index)}
            onDragEnd={() => setDraggingMenuIndex(null)}
            onDragOver={(event) => event.preventDefault()}
            onDrop={() => {
              if (draggingMenuIndex === null) return;
              setHomeField(
                "navLinks",
                reorderItems(homeForm.navLinks, draggingMenuIndex, index)
              );
              setDraggingMenuIndex(null);
            }}
            className={draggingMenuIndex === index ? "opacity-60" : ""}
          >
            <ItemCard
              title={`${"\u041f\u0443\u043d\u043a\u0442"} ${index + 1}`}
              icon={Grip}
              onRemove={() =>
                setHomeField(
                  "navLinks",
                  homeForm.navLinks.filter((_, itemIndex) => itemIndex !== index)
                )
              }
              disableRemove={homeForm.navLinks.length <= 1}
            >
              <DraggableHint />
              <div className="grid gap-3">
                <Field
                  label={"\u041d\u0430\u0437\u0432\u0430\u043d\u0438\u0435"}
                  value={item.label}
                  onChange={(value) => updateNavLink(index, "label", value)}
                />
                <label className="space-y-2">
                  <span className="text-sm font-medium text-forest">
                    {"\u0412\u0435\u0434\u0435\u0442 \u043a \u0431\u043b\u043e\u043a\u0443"}
                  </span>
                  <select
                    value={item.target}
                    onChange={(event) =>
                      updateNavLink(index, "target", event.target.value)
                    }
                    className="w-full rounded-xl border border-sage-light/30 bg-white px-4 py-3 text-sm text-forest outline-none transition focus:border-sage"
                  >
                    {menuTargets.map((target) => (
                      <option key={target.value} value={target.value}>
                        {target.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </ItemCard>
          </div>
        ))}
      </div>
    </EditorAccordionSection>
  );
}
