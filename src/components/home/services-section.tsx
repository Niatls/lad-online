import Image from "next/image";

import type { HomeServiceItem } from "@/lib/content";

import { FadeIn } from "./fade-in";

const serviceImages: Record<string, string> = {
  "Личные границы": "/service-lichnye-granitsy.png",
  "Стресс и тревога": "/service-stress-i-trevoga.png",
  "Депрессия и апатия": "/service-depressiya-i-apatiya.png",
  "Семейные отношения": "/service-semeynye-otnosheniya.png",
  "Принятие себя": "/service-prinyatie-sebya.png",
  "Свободная тематика": "/service-svobodnaya-tematika.png",
};

type ServicesSectionProps = {
  services: HomeServiceItem[];
};

export function ServicesSection({ services }: ServicesSectionProps) {
  return (
    <section id="services" className="bg-cream py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-sage-light/20 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-sage-dark">
              Помощь
            </span>
            <h2 className="mb-4 text-3xl font-bold text-forest sm:text-4xl">
              С чем мы можем помочь
            </h2>
            <p className="leading-relaxed text-forest/50">
              Наши специалисты работают с широким спектром психологических
              трудностей
            </p>
          </div>
        </FadeIn>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service, index) => {
            const imageSrc = serviceImages[service.title];

            return (
              <FadeIn key={`${service.title}-${index}`} delay={index * 100}>
                <div className="group relative aspect-[2/3] h-full overflow-hidden rounded-2xl border border-sage-light/15 bg-white transition-all duration-300 hover:-translate-y-1 hover:border-sage/30 hover:shadow-xl">
                  {imageSrc ? (
                    <div className="absolute inset-0 bg-sage-light/10">
                      <Image
                        src={imageSrc}
                        alt={service.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      />
                    </div>
                  ) : null}
                  <div className="absolute inset-0 bg-gradient-to-t from-forest/74 via-forest/20 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 rounded-t-[1.5rem] rounded-b-2xl border border-white/12 bg-white/[0.035] p-5 shadow-lg backdrop-blur-md sm:p-6">
                    <h3 className="mb-3 text-lg font-bold text-white [text-shadow:0_1px_8px_rgba(0,0,0,0.28)]">
                      {service.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-white/90 [text-shadow:0_1px_8px_rgba(0,0,0,0.22)]">
                      {service.description}
                    </p>
                  </div>
                </div>
              </FadeIn>
            );
          })}
        </div>
      </div>
    </section>
  );
}
