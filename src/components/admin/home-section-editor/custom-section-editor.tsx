import { Field, MarkdownTextareaField } from "@/components/admin/editor-shared";
import type { HomePageSection } from "@/lib/home-sections";

import { SectionCard } from "./section-card";
import type { CustomSectionEditorProps } from "./types";

export function CustomSectionEditor({
  section,
  updateSection,
}: CustomSectionEditorProps) {
  const updateCurrentSection = (updates: Partial<HomePageSection>) => {
    updateSection(section.id, (current) => ({ ...current, ...updates }));
  };

  return (
    <SectionCard
      title={"\u0421\u0432\u043e\u044f \u0441\u0435\u043a\u0446\u0438\u044f"}
      description={
        "\u0421\u0432\u043e\u0431\u043e\u0434\u043d\u044b\u0439 \u0438\u043d\u0444\u043e\u0440\u043c\u0430\u0446\u0438\u043e\u043d\u043d\u044b\u0439 \u0431\u043b\u043e\u043a \u0441 \u0437\u0430\u0433\u043e\u043b\u043e\u0432\u043a\u0430\u043c\u0438, \u0442\u0435\u043a\u0441\u0442\u043e\u043c \u0438 \u043a\u043d\u043e\u043f\u043a\u043e\u0439."
      }
    >
      <div className="grid gap-4 md:grid-cols-2">
        <Field
          label={"\u041f\u043b\u0430\u0448\u043a\u0430"}
          value={section.badge}
          onChange={(badge) => updateCurrentSection({ badge })}
        />
        <Field
          label={"\u0417\u0430\u0433\u043e\u043b\u043e\u0432\u043e\u043a"}
          value={section.title}
          onChange={(title) => updateCurrentSection({ title })}
        />
      </div>

      <div className="mt-4 space-y-4">
        <Field
          label={"\u041f\u043e\u0434\u0437\u0430\u0433\u043e\u043b\u043e\u0432\u043e\u043a"}
          value={section.subtitle}
          onChange={(subtitle) => updateCurrentSection({ subtitle })}
        />
        <MarkdownTextareaField
          label={"\u0422\u0435\u043a\u0441\u0442 \u0441\u0435\u043a\u0446\u0438\u0438"}
          rows={8}
          value={section.body}
          onChange={(body) => updateCurrentSection({ body })}
        />
        <div className="grid gap-4 md:grid-cols-2">
          <Field
            label={"\u0422\u0435\u043a\u0441\u0442 \u043a\u043d\u043e\u043f\u043a\u0438"}
            value={section.ctaLabel}
            onChange={(ctaLabel) => updateCurrentSection({ ctaLabel })}
          />
          <Field
            label={"\u041a\u0443\u0434\u0430 \u0432\u0435\u0434\u0435\u0442 \u043a\u043d\u043e\u043f\u043a\u0430"}
            value={section.ctaTarget}
            onChange={(ctaTarget) => updateCurrentSection({ ctaTarget })}
            placeholder="booking"
          />
        </div>
        <label className="space-y-2">
          <span className="text-sm font-medium text-forest">
            {"\u0421\u0442\u0438\u043b\u044c \u0441\u0435\u043a\u0446\u0438\u0438"}
          </span>
          <select
            value={section.variant}
            onChange={(event) =>
              updateCurrentSection({
                variant: event.target.value as HomePageSection["variant"],
              })
            }
            className="w-full rounded-xl border border-sage-light/30 bg-white px-4 py-3 text-sm text-forest outline-none transition focus:border-sage"
          >
            <option value="default">
              {"\u041e\u0431\u044b\u0447\u043d\u0430\u044f"}
            </option>
            <option value="highlight">
              {"\u0410\u043a\u0446\u0435\u043d\u0442\u043d\u0430\u044f"}
            </option>
            <option value="quote">
              {"\u0426\u0438\u0442\u0430\u0442\u0430 / \u0442\u0435\u043c\u043d\u0430\u044f"}
            </option>
          </select>
        </label>
      </div>
    </SectionCard>
  );
}
