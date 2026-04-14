import { CheckCircle2, Leaf, Shield } from "lucide-react";
import Image from "next/image";

import { useLiveEditor } from "@/components/admin/live-editor-context";
import { EditableText } from "@/components/admin/editable-text";
import type { HomePageContent } from "@/lib/content";

import { FadeIn } from "./fade-in";

const principles = [
  "Полная анонимность всех записей",
  "Удаление данных по вашему желанию",
  "Соблюдение ФЗ-152 и других законов о защите данных",
  "Никакой ответственности за ваши действия",
  "Защита информации от третьих лиц",
];

const exclusions = [
  "Магические шары и карты таро",
  "«10 правил успеха»",
  "Эзотерические практики",
  "Инфо-курсы и тренинги",
];

type AboutSectionProps = {
  content: HomePageContent;
};

export function AboutSection({ content }: AboutSectionProps) {
  const { setHomeContent, homeContent } = useLiveEditor();
  const activeContent = homeContent || content;

  return (
    <section id="about" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <FadeIn>
            <div className="relative">
              <div className="overflow-hidden rounded-3xl shadow-2xl">
                <img
                  src="/about-bg.png"
                  alt="Офис психологических консультаций"
                  className="h-80 w-full object-cover sm:h-96"
                />
              </div>
              <div className="absolute -bottom-6 -right-4 rounded-2xl border border-sage-light/20 bg-white p-5 shadow-xl sm:right-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sage-light/30">
                    <Shield className="h-6 w-6 text-sage-dark" />
                  </div>
                  <div>
                    <p className="text-xs text-forest/50">Защита данных</p>
                    <p className="text-sm font-bold text-forest">ФЗ-152</p>
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>

          <FadeIn delay={200}>
            <div className="space-y-8">
              <div>
                <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-sage-light/20 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-sage-dark">
                  О нас
                </span>
                <h2 className="text-3xl font-bold tracking-tight text-forest sm:text-4xl">
                  <EditableText
                    tagName="span"
                    value={activeContent.aboutTitle}
                    onChange={(val) => setHomeContent({ ...activeContent, aboutTitle: val })}
                  />
                </h2>
                <EditableText
                  tagName="p"
                  className="mt-6 text-lg leading-8 text-forest/70"
                  value={activeContent.aboutIntro}
                  onChange={(val) => setHomeContent({ ...activeContent, aboutIntro: val })}
                />
                <div className="mt-8 space-y-6 text-base leading-7 text-forest/60">
                  <EditableText
                    tagName="p"
                    value={activeContent.aboutDescription}
                    onChange={(val) => setHomeContent({ ...activeContent, aboutDescription: val })}
                  />
                </div>
              </div>

              <div className="rounded-2xl border border-sage-light/20 bg-cream p-6">
                <h4 className="mb-4 flex items-center gap-2 text-sm font-bold text-forest">
                  <CheckCircle2 className="h-4 w-4 text-sage-dark" />
                  Наши принципы
                </h4>
                <ul className="space-y-3">
                  {principles.map((rule) => (
                    <li
                      key={rule}
                      className="flex items-start gap-3 text-sm text-forest/60"
                    >
                      <Leaf className="mt-0.5 h-4 w-4 flex-shrink-0 text-sage" />
                      <span>{rule}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-2xl border border-sage-light/20 bg-sage-light/10 p-6">
                <h4 className="mb-3 text-sm font-bold text-forest/70">
                  На этом сайте вы не найдете:
                </h4>
                <div className="grid gap-2 sm:grid-cols-2">
                  {exclusions.map((item) => (
                    <p
                      key={item}
                      className="flex items-center gap-2 text-xs text-forest/40"
                    >
                      <span className="text-sage-dark">×</span> {item}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
