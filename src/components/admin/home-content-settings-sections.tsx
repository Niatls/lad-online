"use client";

import { Grip, ListChecks, Plus } from "lucide-react";

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
        description="Пункты навигации в шапке сайта."
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
            <ItemCard
              key={`${item.target}-${index}`}
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
        description="Карточки услуг на главной странице."
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
            <ItemCard
              key={`${service.title}-${index}`}
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
          ))}
        </div>
      </EditorAccordionSection>
    </Accordion>
  );
}
