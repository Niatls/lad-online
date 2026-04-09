import { CheckCircle2, Leaf, Shield } from "lucide-react";

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

export function AboutSection() {
  return (
    <section id="about" className="py-24 sm:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <FadeIn>
            <div className="relative">
              <div className="rounded-3xl overflow-hidden shadow-2xl">
                <img
                  src="/about-bg.png"
                  alt="Офис психологических консультаций"
                  className="w-full h-80 sm:h-96 object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -right-4 sm:right-6 bg-white rounded-2xl shadow-xl border border-sage-light/20 p-5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-sage-light/30 flex items-center justify-center">
                    <Shield className="w-6 h-6 text-sage-dark" />
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
                <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-sage-light/20 text-sage-dark text-xs font-semibold uppercase tracking-wider rounded-full mb-4">
                  О нас
                </span>
                <h2 className="text-3xl sm:text-4xl font-bold text-forest mb-6">
                  Команда профессионалов, которой можно доверять
                </h2>
              </div>

              <p className="text-forest/60 leading-relaxed">
                Мы — небольшая команда дипломированных психологов,
                специализирующихся на работе с людьми и их психологическими
                трудностями. Каждый из нашей команды работает непосредственно по
                своей специальности.
              </p>
              <p className="text-forest/60 leading-relaxed">
                Данный ресурс был создан исключительно для работы с клиентами, у
                которых есть реальные психологические трудности. Мы не продаём
                ложные иллюзии, религиозную тематику, инфо-курсы и эзотерические
                практики.
              </p>

              <div className="bg-cream rounded-2xl p-6 border border-sage-light/20">
                <h4 className="text-sm font-bold text-forest mb-4 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-sage-dark" />
                  Наши принципы
                </h4>
                <ul className="space-y-3">
                  {principles.map((rule) => (
                    <li
                      key={rule}
                      className="flex items-start gap-3 text-sm text-forest/60"
                    >
                      <Leaf className="w-4 h-4 text-sage mt-0.5 flex-shrink-0" />
                      <span>{rule}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-sage-light/10 rounded-2xl p-6 border border-sage-light/20">
                <h4 className="text-sm font-bold text-forest/70 mb-3">
                  На этом сайте вы НЕ найдёте:
                </h4>
                <div className="grid sm:grid-cols-2 gap-2">
                  {exclusions.map((item) => (
                    <p
                      key={item}
                      className="flex items-center gap-2 text-xs text-forest/40"
                    >
                      <span className="text-sage-dark">✕</span> {item}
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
