import { ArrowRight } from "lucide-react";

import { RichMarkdown } from "@/components/articles/rich-markdown";
import { useLiveEditor } from "@/components/admin/live-editor-context";
import { EditableText } from "@/components/admin/editable-text";
import type { HomePageSection } from "@/lib/home-sections";

type CustomHomeSectionProps = {
  onScrollToSection: (id: string) => void;
  section: HomePageSection;
};

export function CustomHomeSection({
  onScrollToSection,
  section,
}: CustomHomeSectionProps) {
  const { updateSection } = useLiveEditor();
  const wrapperClassName =
    section.variant === "highlight"
      ? "bg-[linear-gradient(180deg,_#f3ebdc_0%,_#fffaf3_100%)]"
      : section.variant === "quote"
        ? "bg-forest text-white"
        : "bg-white";

  const cardClassName =
    section.variant === "quote"
      ? "border-white/10 bg-white/5"
      : "border-sage-light/20 bg-white/90";

  return (
    <section id={section.id} className={`py-24 sm:py-32 ${wrapperClassName}`}>
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div
          className={`rounded-[2rem] border p-8 shadow-sm backdrop-blur sm:p-12 ${cardClassName}`}
        >
          {section.badge ? (
            <span
              className={`mb-5 inline-flex rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] ${
                section.variant === "quote"
                  ? "bg-white/10 text-white/80"
                  : "bg-sage-light/20 text-sage-dark"
              }`}
            >
              <EditableText
                tagName="span"
                value={section.badge}
                onChange={(val) => updateSection(section.id, { badge: val })}
              />
            </span>
          ) : null}

          <EditableText
            tagName="h2"
            className={`text-3xl font-bold leading-tight sm:text-4xl ${
              section.variant === "quote" ? "text-white" : "text-forest"
            }`}
            value={section.title}
            onChange={(val) => updateSection(section.id, { title: val })}
          />

          {section.subtitle ? (
            <EditableText
              tagName="p"
              className={`mt-4 text-lg leading-8 ${
                section.variant === "quote" ? "text-white/70" : "text-forest/60"
              }`}
              value={section.subtitle}
              onChange={(val) => updateSection(section.id, { subtitle: val })}
            />
          ) : null}

          {section.body ? (
            <div className="mt-8">
              <RichMarkdown
                content={section.body}
                theme={section.variant === "quote" ? "dark" : "light"}
              />
            </div>
          ) : null}

          {section.ctaLabel && section.ctaTarget ? (
            <button
              type="button"
              onClick={() => onScrollToSection(section.ctaTarget)}
              className={`mt-8 inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition ${
                section.variant === "quote"
                  ? "bg-white text-forest hover:bg-cream"
                  : "bg-sage text-white hover:bg-sage-dark"
              }`}
            >
              <EditableText
                tagName="span"
                value={section.ctaLabel}
                onChange={(val) => updateSection(section.id, { ctaLabel: val })}
              />
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : null}
        </div>
      </div>
    </section>
  );
}
