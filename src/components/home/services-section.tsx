import {
  Heart,
  MessageCircle,
  Shield,
  Sparkles,
  Star,
  Users,
} from "lucide-react";

import { FadeIn } from "./fade-in";

const services = [
  {
    icon: Shield,
    title: "Личные границы",
    desc: "Работа над личными границами, развитие навыков отстаивать свои интересы и строить здоровые отношения с окружающими.",
  },
  {
    icon: Heart,
    title: "Стресс и тревога",
    desc: "Помощь при стрессовых ситуациях, тревожных расстройствах, фобиях и панических атаках. Научимся управлять эмоциями.",
  },
  {
    icon: Sparkles,
    title: "Депрессия и апатия",
    desc: "Поддержка при депрессивных состояниях, потере мотивации, апатии. Возвращение интереса к жизни и энергии.",
  },
  {
    icon: Users,
    title: "Семейные отношения",
    desc: "Психологическая помощь при разводе, расставании, семейных конфликтах и трудностях в браке.",
  },
  {
    icon: Star,
    title: "Принятие себя",
    desc: "Работа с самооценкой, принятие себя после травматических событий, развитие самосознания и внутренней силы.",
  },
  {
    icon: MessageCircle,
    title: "Свободная тематика",
    desc: "Консультирование по любым вопросам, которые вас беспокоят. Вы определяете направление работы.",
  },
];

export function ServicesSection() {
  return (
    <section id="services" className="py-24 sm:py-32 bg-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-sage-light/20 text-sage-dark text-xs font-semibold uppercase tracking-wider rounded-full mb-4">
              Помощь
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-forest mb-4">
              С чем мы можем помочь
            </h2>
            <p className="text-forest/50 leading-relaxed">
              Наши специалисты работают с широким спектром психологических
              трудностей
            </p>
          </div>
        </FadeIn>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => (
            <FadeIn key={service.title} delay={index * 100}>
              <div className="group bg-white rounded-2xl p-6 sm:p-8 border border-sage-light/15 hover:border-sage/30 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 h-full">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-sage-light/50 to-sage/20 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                  <service.icon className="w-7 h-7 text-sage-dark" />
                </div>
                <h3 className="text-lg font-bold text-forest mb-3">
                  {service.title}
                </h3>
                <p className="text-forest/50 text-sm leading-relaxed">
                  {service.desc}
                </p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
