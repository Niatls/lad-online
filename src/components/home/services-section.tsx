import {
  Heart,
  MessageCircle,
  Shield,
  Sparkles,
  Star,
  Users,
} from "lucide-react";

import type { HomeServiceItem } from "@/lib/content";

import { FadeIn } from "./fade-in";

const serviceIcons = [Shield, Heart, Sparkles, Users, Star, MessageCircle];

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
            const Icon = serviceIcons[index % serviceIcons.length];

            return (
              <FadeIn key={`${service.title}-${index}`} delay={index * 100}>
                <div className="group h-full rounded-2xl border border-sage-light/15 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-sage/30 hover:shadow-xl sm:p-8">
                  <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-sage-light/50 to-sage/20 transition-transform duration-300 group-hover:scale-110">
                    <Icon className="h-7 w-7 text-sage-dark" />
                  </div>
                  <h3 className="mb-3 text-lg font-bold text-forest">
                    {service.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-forest/50">
                    {service.description}
                  </p>
                </div>
              </FadeIn>
            );
          })}
        </div>
      </div>
    </section>
  );
}
