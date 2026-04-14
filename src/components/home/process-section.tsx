import { Clock, Heart, MessageCircle, Users } from "lucide-react";

import { FadeIn } from "./fade-in";

const processSteps = [
  {
    step: "01",
    icon: MessageCircle,
    title: "Запись",
    desc: "Подайте заявку на консультацию через форму на сайте или мессенджер. Мы свяжемся с вами и назначим внутренний номер.",
  },
  {
    step: "02",
    icon: Clock,
    title: "Подбор специалиста",
    desc: "После получения заявки мы подберём специалиста, подходящего именно для вашей ситуации. Это может занять некоторое время.",
  },
  {
    step: "03",
    icon: Users,
    title: "Работа с психологом",
    desc: "Знакомство с психологом, обсуждение ваших трудностей и целенаправленная работа над решением проблем.",
  },
  {
    step: "04",
    icon: Heart,
    title: "Результат",
    desc: "Подведение итогов. Вы научитесь самостоятельно справляться с трудностями и обретёте внутреннюю устойчивость.",
  },
];

export function ProcessSection() {
  return (
    <section id="process" className="py-24 sm:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-sage-light/20 text-sage-dark text-xs font-semibold uppercase tracking-wider rounded-full mb-4">
              Процесс
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-forest mb-4">
              Как проходит консультация
            </h2>
            <p className="text-forest/50 leading-relaxed">
              Мы создали прозрачный и комфортный процесс, чтобы вы чувствовали
              себя безопасно на каждом этапе
            </p>
          </div>
        </FadeIn>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {processSteps.map((item, index) => (
            <FadeIn key={item.step} delay={index * 150}>
              <div className="relative group">
                {index < processSteps.length - 1 && (
                  <div className="hidden lg:block absolute top-12 left-full w-full h-px bg-gradient-to-r from-sage-light/40 to-transparent z-0" />
                )}
                <div className="relative bg-cream rounded-2xl p-6 sm:p-8 border border-sage-light/20 hover:border-sage/30 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 h-full">
                  <div className="flex items-center gap-4 mb-5">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sage-light to-sage/30 flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                      <item.icon className="w-6 h-6 text-sage-dark" />
                    </div>
                    <span className="text-xs font-bold text-sage/40 tracking-widest">
                      ШАГ {item.step}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-forest mb-3">
                    {item.title}
                  </h3>
                  <p className="text-forest/50 text-sm leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
