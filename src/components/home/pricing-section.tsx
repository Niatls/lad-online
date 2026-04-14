import { FadeIn } from "./fade-in";

const pricingPlans = [
  {
    title: "Начальная консультация",
    desc: "Знакомство с клиентом, первичная оценка ситуации",
    price: "500 ₽",
    highlight: false,
  },
  {
    title: "Стандартная консультация",
    desc: "Тревоги, стресс, депрессия, потеря мотивации",
    price: "500 — 2 500 ₽",
    highlight: true,
  },
  {
    title: "Консультация с подростками",
    desc: "Работа с подростковыми трудностями и кризисами",
    price: "500 — 2 000 ₽",
    highlight: false,
  },
  {
    title: "Консультация ПТСР",
    desc: "Работа с посттравматическим стрессовым расстройством",
    price: "1 000 — 3 500 ₽",
    highlight: true,
  },
  {
    title: "Консультация с детьми",
    desc: "Психологическая помощь для детей",
    price: "500 — 1 500 ₽",
    highlight: false,
  },
  {
    title: "Семейное консультирование",
    desc: "Работа с семейными конфликтами и разводами",
    price: "1 000 — 3 000 ₽",
    highlight: true,
  },
  {
    title: "После развода",
    desc: "Помощь при бракоразводных процессах",
    price: "500 — 2 000 ₽",
    highlight: false,
  },
  {
    title: "Групповой сеанс",
    desc: "Смешанные темы, групповая динамика",
    price: "1 500 — 3 000 ₽",
    highlight: false,
  },
  {
    title: "Свободная тематика",
    desc: "Любые вопросы, которые вас беспокоят",
    price: "500 — 1 500 ₽",
    highlight: false,
  },
];

export function PricingSection() {
  return (
    <section id="pricing" className="py-24 sm:py-32 bg-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-sage-light/20 text-sage-dark text-xs font-semibold uppercase tracking-wider rounded-full mb-4">
              Стоимость
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-forest mb-4">
              Услуги и цены
            </h2>
            <p className="text-forest/50 leading-relaxed">
              Прозрачное ценообразование без скрытых платежей. Стоимость зависит
              от сложности и длительности консультации
            </p>
          </div>
        </FadeIn>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {pricingPlans.map((plan, index) => (
            <FadeIn key={plan.title} delay={index * 80}>
              <div
                className={`rounded-2xl p-6 sm:p-8 border h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${
                  plan.highlight
                    ? "bg-white border-sage/30 shadow-md"
                    : "bg-white border-sage-light/15"
                }`}
              >
                {plan.highlight && (
                  <span className="inline-block px-3 py-1 bg-sage-light/30 text-sage-dark text-xs font-semibold rounded-full mb-4">
                    Популярное
                  </span>
                )}
                <h3 className="text-base font-bold text-forest mb-2">
                  {plan.title}
                </h3>
                <p className="text-forest/45 text-sm mb-5 leading-relaxed">
                  {plan.desc}
                </p>
                <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sage-dark to-forest">
                  {plan.price}
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
