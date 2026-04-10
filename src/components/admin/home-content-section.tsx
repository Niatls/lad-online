"use client";

import {
  Eye,
  Grip,
  LayoutTemplate,
  ListChecks,
  Plus,
  Save,
} from "lucide-react";

import type {
  HomeNavLink,
  HomePageContent,
  HomeServiceItem,
} from "@/lib/content";

import { ActionButton, Card, ItemCard } from "./home-content-cards";
import { Field, MarkdownTextareaField, SectionShell } from "./editor-shared";
import { menuTargets } from "./editor-types";

type HomeContentSectionProps = {
  homeForm: HomePageContent;
  isSavingHome: boolean;
  onOpenPreview: () => void;
  onSave: () => void;
  setHomeField: <K extends keyof HomePageContent>(
    key: K,
    value: HomePageContent[K]
  ) => void;
};

export function HomeContentSection({
  homeForm,
  isSavingHome,
  onOpenPreview,
  onSave,
  setHomeField,
}: HomeContentSectionProps) {
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
    <SectionShell
      title="Главная страница"
      description="Редактируйте ключевые блоки первого экрана, меню, услуги и контакты в одном месте."
      icon={LayoutTemplate}
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
        <div className="space-y-6">
          <Card title="Первый экран">
            <div className="grid gap-4 md:grid-cols-2">
              <Field
                label="Плашка"
                value={homeForm.heroBadge}
                onChange={(value) => setHomeField("heroBadge", value)}
              />
              <Field
                label="Заголовок, первая строка"
                value={homeForm.heroTitle}
                onChange={(value) => setHomeField("heroTitle", value)}
              />
              <Field
                label="Заголовок, акцент"
                value={homeForm.heroTitleAccent}
                onChange={(value) => setHomeField("heroTitleAccent", value)}
              />
            </div>
            <div className="mt-4">
              <MarkdownTextareaField
                label="Описание первого экрана"
                rows={4}
                value={homeForm.heroDescription}
                onChange={(value) => setHomeField("heroDescription", value)}
              />
            </div>
          </Card>

          <Card title="Блок «О нас»">
            <div className="space-y-4">
              <Field
                label="Заголовок блока"
                value={homeForm.aboutTitle}
                onChange={(value) => setHomeField("aboutTitle", value)}
              />
              <MarkdownTextareaField
                label="Первый абзац"
                rows={4}
                value={homeForm.aboutIntro}
                onChange={(value) => setHomeField("aboutIntro", value)}
              />
              <MarkdownTextareaField
                label="Второй абзац"
                rows={4}
                value={homeForm.aboutDescription}
                onChange={(value) => setHomeField("aboutDescription", value)}
              />
            </div>
          </Card>

          <Card title="Блок записи">
            <div className="space-y-4">
              <Field
                label="Заголовок блока"
                value={homeForm.bookingTitle}
                onChange={(value) => setHomeField("bookingTitle", value)}
              />
              <MarkdownTextareaField
                label="Описание блока"
                rows={4}
                value={homeForm.bookingDescription}
                onChange={(value) => setHomeField("bookingDescription", value)}
              />
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card
            title="Меню"
            action={
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
            }
          >
            <div className="space-y-3">
              {homeForm.navLinks.map((item, index) => (
                <ItemCard
                  key={`${item.target}-${index}`}
                  title={`Пункт ${index + 1}`}
                  icon={Grip}
                  onRemove={() =>
                    setHomeField(
                      "navLinks",
                      homeForm.navLinks.filter(
                        (_, itemIndex) => itemIndex !== index
                      )
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
          </Card>

          <Card title="Контакты">
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
          </Card>
        </div>
      </div>

      <div className="mt-6 rounded-[1.5rem] border border-sage-light/20 bg-white p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-forest">Услуги</h3>
            <p className="text-sm text-forest/50">
              Отдельный редактор карточек услуг на главной и в футере.
            </p>
          </div>
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
                  onChange={(value) =>
                    updateService(index, "description", value)
                  }
                />
              </div>
            </ItemCard>
          ))}
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <ActionButton
          label={isSavingHome ? "Сохраняю..." : "Сохранить главную"}
          onClick={onSave}
          icon={Save}
          disabled={isSavingHome}
        />
        <button
          type="button"
          onClick={onOpenPreview}
          className="inline-flex items-center gap-2 rounded-xl bg-cream px-5 py-3 text-sm font-semibold text-forest transition hover:bg-sage-light/20"
        >
          <Eye className="h-4 w-4" />
          Открыть предпросмотр
        </button>
      </div>
    </SectionShell>
  );
}
