"use client";

import {
  ArrowRight,
  ChevronDown,
  Clock,
  Heart,
  Shield,
  Sparkles,
  Star,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { useLiveEditor } from "@/components/admin/live-editor-context";
import { EditableText } from "@/components/admin/editable-text";
import type { HomePageContent } from "@/lib/content";

type HeroSectionProps = {
  content: HomePageContent;
  onScrollToSection: (id: string) => void;
};

const heroStats = [
  { icon: Shield, label: "Анонимность" },
  { icon: Users, label: "Дипломированные специалисты" },
  { icon: Clock, label: "Онлайн-формат" },
];

export function HeroSection({ content, onScrollToSection }: HeroSectionProps) {
  const { setHomeContent, homeContent } = useLiveEditor();
  const activeContent = homeContent || content;

  return (
    <section className="relative flex min-h-screen items-center overflow-hidden">
      <div className="absolute inset-0">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/hero-original.png')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-cream/95 via-cream/85 to-cream/60" />
        <div className="absolute right-10 top-20 h-72 w-72 animate-float rounded-full bg-sage-light/20 blur-3xl" />
        <div className="animation-delay-400 absolute bottom-20 left-10 h-96 w-96 animate-float rounded-full bg-sage/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-32 sm:px-6 sm:py-40 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="space-y-8">
            <div className="animate-fade-in-up">
              <span className="inline-flex items-center gap-2 rounded-full border border-sage-light/40 bg-sage-light/30 px-4 py-2 text-sm font-medium text-sage-dark">
                <Sparkles className="h-4 w-4" />
                <EditableText
                  tagName="span"
                  value={activeContent.heroBadge}
                  onChange={(val) => setHomeContent({ ...activeContent, heroBadge: val })}
                />
              </span>
            </div>

            <h1 className="animation-delay-200 animate-fade-in-up text-4xl font-bold leading-tight text-forest sm:text-5xl lg:text-6xl">
              <EditableText
                tagName="span"
                value={activeContent.heroTitle}
                onChange={(val) => setHomeContent({ ...activeContent, heroTitle: val })}
              />
              <EditableText
                tagName="span"
                className="block bg-gradient-to-r from-sage to-sage-dark bg-clip-text text-transparent"
                value={activeContent.heroTitleAccent}
                onChange={(val) => setHomeContent({ ...activeContent, heroTitleAccent: val })}
              />
            </h1>

            <EditableText
              tagName="p"
              className="animation-delay-400 animate-fade-in-up max-w-lg text-lg leading-relaxed text-forest/60 sm:text-xl"
              value={activeContent.heroDescription}
              onChange={(val) => setHomeContent({ ...activeContent, heroDescription: val })}
            />

            <div className="animation-delay-600 animate-fade-in-up flex flex-wrap gap-4">
              <Button
                size="lg"
                onClick={() => onScrollToSection("booking")}
                className="rounded-xl border-0 bg-gradient-to-r from-sage to-sage-dark px-8 py-6 text-base text-white shadow-lg transition-all duration-300 hover:from-sage-dark hover:to-forest hover:shadow-xl"
              >
                Записаться на консультацию
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => onScrollToSection("process")}
                className="rounded-xl border-2 border-sage-light px-8 py-6 text-base text-forest hover:bg-sage-light/20"
              >
                Как это работает
              </Button>
            </div>

            <div className="animation-delay-800 animate-fade-in-up flex gap-8 pt-4">
              {heroStats.map((stat) => (
                <div
                  key={stat.label}
                  className="flex items-center gap-2 text-sm text-forest/50"
                >
                  <stat.icon className="h-4 w-4 text-sage" />
                  <span className="hidden sm:inline">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="hidden justify-center lg:flex">
            <div className="relative">
              <div className="animate-float flex h-96 w-80 flex-col justify-between rounded-3xl border border-sage-light/30 bg-gradient-to-br from-sage-light/40 to-sage/20 p-8 shadow-2xl backdrop-blur-sm">
                <div>
                  <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/60 shadow-lg backdrop-blur-sm">
                    <Heart className="h-8 w-8 text-sage-dark" />
                  </div>
                  <h3 className="mb-3 text-xl font-bold text-forest">
                    Начните путь к себе
                  </h3>
                  <p className="text-sm leading-relaxed text-forest/60">
                    Первый шаг к изменениям — это признание необходимости
                    помощи. Мы рядом.
                  </p>
                </div>
                <div className="flex gap-2">
                  {[...Array(5)].map((_, index) => (
                    <Star
                      key={index}
                      className={index < 4 ? "h-5 w-5 fill-amber-400 text-amber-400" : "h-5 w-5 text-amber-400"}
                    />
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <ChevronDown className="h-6 w-6 text-sage/50" />
      </div>
    </section>
  );
}
