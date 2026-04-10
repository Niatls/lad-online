"use client";

import { Grip, GripVertical, ListChecks, Plus } from "lucide-react";
import { useState } from "react";

import type {
  HomeNavLink,
  HomePageContent,
  HomeServiceItem,
} from "@/lib/content";

import { Accordion } from "@/components/ui/accordion";

import { EditorAccordionSection } from "./editor-accordion-section";
import { Field, MarkdownTextareaField } from "./editor-shared";
import { menuTargets } from "./editor-types";
import { ActionButton, ItemCard } from "./home-content-cards";
import { reorderItems } from "./sort-utils";

type HomeContentSettingsSectionsProps = {
  homeForm: HomePageContent;
  setHomeField: <K extends keyof HomePageContent>(
    key: K,
    value: HomePageContent[K]
  ) => void;
};

export function HomeContentSettingsSections({
  homeForm,
  setHomeField,
}: HomeContentSettingsSectionsProps) {
  const [draggingMenuIndex, setDraggingMenuIndex] = useState<number | null>(null);
  const [draggingServiceIndex, setDraggingServiceIndex] = useState<number | null>(
    null
  );

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
    <Accordion
      type="multiple"
      defaultValue={["menu", "contacts"]}
      className="space-y-4"
    >
      <EditorAccordionSection
        value="menu"
        title="Меню"
        description="Пункты навигации в шапке сайта. Их можно перетаскивать."
      >
        <div className="mb-4 flex justify-end">
          <ActionButton
            label="Добавить"
            onClick={() =>
              setHomeField("navLinks", [
                ...homeForm.navLinks,
                { label: "Новый пункт", target: "about" },
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
                if (draggingMenuIndex === null) {
                  return;
                }
                setHomeField(
                  "navLinks",
                  reorderItems(homeForm.navLinks, draggingMenuIndex, index)
                );
                setDraggingMenuIndex(null);
              }}
              className={draggingMenuIndex === index ? "opacity-60" : ""}
            >
              <ItemCard
                title={`Пункт ${index + 1}`}
                icon={Grip}
                onRemove={() =>
                  setHomeField(
                    "navLinks",
                    homeForm.navLinks.filter((_, itemIndex) => itemIndex !== index)
                  )
                }
                disableRemove={homeForm.navLinks.length <= 1}
              >
                <div className="mb-3 flex items-center gap-2 rounded-xl bg-white/70 px-3 py-2 text-xs font-medium text-forest/55">
                  <GripVertical className="h-4 w-4" />
                  Перетащите для смены порядка
                </div>
                <div className="grid gap-3">
                  <Field
                    label="Название"
                    value={item.label}
                    onChange={(value) => updateNavLink(index, "label", value)}
                  />
                  <label className="space-y-2">
                    <span className="text-sm font-medium text-forest">
                      Ведет к блоку
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

      <EditorAccordionSection
        value="contacts"
        title="Контакты"
        description="Данные в футере, ссылках и подписи сайта."
      >
        <div className="grid gap-4">
          <Field
            label="Название бренда"
            value={homeForm.contacts.brandName}
            onChange={(value) =>
              setHomeField("contacts", {
                ...homeForm.contacts,
                brandName: value,
              })
            }
          />
          <MarkdownTextareaField
            label="Описание в футере"
            rows={3}
            value={homeForm.contacts.description}
            onChange={(value) =>
              setHomeField("contacts", {
                ...homeForm.contacts,
                description: value,
              })
            }
          />
          <div className="grid gap-4 md:grid-cols-2">
            <Field
              label="Телефон"
              value={homeForm.contacts.phone}
              onChange={(value) =>
                setHomeField("contacts", {
                  ...homeForm.contacts,
                  phone: value,
                })
              }
            />
            <Field
              label="Ссылка телефона"
              value={homeForm.contacts.phoneHref}
              onChange={(value) =>
                setHomeField("contacts", {
                  ...homeForm.contacts,
                  phoneHref: value,
                })
              }
            />
            <Field
              label="Email"
              value={homeForm.contacts.email}
              onChange={(value) =>
                setHomeField("contacts", {
                  ...homeForm.contacts,
                  email: value,
                })
              }
            />
            <Field
              label="Ссылка email"
              value={homeForm.contacts.emailHref}
              onChange={(value) =>
                setHomeField("contacts", {
                  ...homeForm.contacts,
                  emailHref: value,
                })
              }
            />
            <Field
              label="Формат консультаций"
              value={homeForm.contacts.formatLabel}
              onChange={(value) =>
                setHomeField("contacts", {
                  ...homeForm.contacts,
                  formatLabel: value,
                })
              }
            />
            <Field
              label="Подпись о защите данных"
              value={homeForm.contacts.dataProtectionLabel}
              onChange={(value) =>
                setHomeField("contacts", {
                  ...homeForm.contacts,
                  dataProtectionLabel: value,
                })
              }
            />
          </div>
        </div>
      </EditorAccordionSection>

      <EditorAccordionSection
        value="services"
        title="Услуги"
        description="Карточки услуг на главной странице. Их тоже можно перетаскивать."
      >
        <div className="mb-4 flex justify-end">
          <ActionButton
            label="Добавить услугу"
            onClick={() =>
              setHomeField("services", [
                ...homeForm.services,
                {
                  title: "Новая услуга",
                  description: "Краткое описание услуги.",
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
                if (draggingServiceIndex === null) {
                  return;
                }
                setHomeField(
                  "services",
                  reorderItems(homeForm.services, draggingServiceIndex, index)
                );
                setDraggingServiceIndex(null);
              }}
              className={draggingServiceIndex === index ? "opacity-60" : ""}
            >
              <ItemCard
                title={`Услуга ${index + 1}`}
                icon={ListChecks}
                onRemove={() =>
                  setHomeField(
                    "services",
                    homeForm.services.filter((_, itemIndex) => itemIndex !== index)
                  )
                }
                disableRemove={homeForm.services.length <= 1}
              >
                <div className="mb-3 flex items-center gap-2 rounded-xl bg-white/70 px-3 py-2 text-xs font-medium text-forest/55">
                  <GripVertical className="h-4 w-4" />
                  Перетащите для смены порядка
                </div>
                <div className="space-y-4">
                  <Field
                    label="Название услуги"
                    value={service.title}
                    onChange={(value) => updateService(index, "title", value)}
                  />
                  <MarkdownTextareaField
                    label="Описание"
                    rows={4}
                    value={service.description}
                    onChange={(value) => updateService(index, "description", value)}
                  />
                </div>
              </ItemCard>
            </div>
          ))}
        </div>
      </EditorAccordionSection>
    </Accordion>
  );
}
