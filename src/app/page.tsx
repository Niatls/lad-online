"use client";

import { useState, useEffect, useRef, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  MessageCircle,
  Phone,
  Mail,
  MapPin,
  ChevronDown,
  Heart,
  Shield,
  Users,
  Clock,
  Star,
  ArrowRight,
  CheckCircle2,
  Leaf,
  Sparkles,
  Send,
  Menu,
  X,
  LoaderCircle,
  BookOpen,
} from "lucide-react";

/* ─────────────────── Intersection Observer Hook ─────────────────── */
function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setVisible(true);
          obs.unobserve(el);
        }
      },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

function FadeIn({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const { ref, visible } = useInView();
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${className}`}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(40px)",
        transitionDelay: `${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

/* ─────────────────────── Messenger Icons ─────────────────────── */
function DiscordIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z" />
    </svg>
  );
}

function TelegramIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
    </svg>
  );
}

function VKIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M15.684 0H8.316C1.592 0 0 1.592 0 8.316v7.368C0 22.408 1.592 24 8.316 24h7.368C22.408 24 24 22.408 24 15.684V8.316C24 1.592 22.391 0 15.684 0zm3.692 17.123h-1.744c-.66 0-.864-.525-2.05-1.727-1.033-1-1.49-1.135-1.744-1.135-.356 0-.458.102-.458.593v1.575c0 .424-.135.678-1.253.678-1.846 0-3.896-1.12-5.339-3.202C4.624 10.857 4.03 8.57 4.03 8.096c0-.254.102-.491.593-.491h1.744c.44 0 .61.203.779.678.847 2.49 2.273 4.675 2.859 4.675.22 0 .322-.102.322-.66V9.721c-.068-1.186-.695-1.287-.695-1.71 0-.203.17-.407.44-.407h2.744c.373 0 .508.203.508.643v3.473c0 .372.17.508.271.508.22 0 .407-.136.813-.542 1.254-1.406 2.153-3.574 2.153-3.574.119-.254.322-.491.763-.491h1.744c.525 0 .644.27.525.643-.22 1.017-2.354 4.031-2.354 4.031-.186.305-.254.44 0 .78.186.254.796.779 1.203 1.253.745.847 1.32 1.558 1.473 2.05.17.49-.085.744-.576.744z" />
    </svg>
  );
}

function WhatsAppIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
    </svg>
  );
}

/* ─────────────────── Main Page Component ─────────────────── */
export default function LadPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    reason: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submittedApplicationNumber, setSubmittedApplicationNumber] = useState("");

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError("");

    try {
      const response = await fetch("/api/applications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok || !result.ok) {
        throw new Error(result.message || "Не удалось отправить заявку");
      }

      setSubmittedApplicationNumber(result.applicationNumber);
      setFormData({ name: "", email: "", phone: "", reason: "" });
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Не удалось отправить заявку. Попробуйте еще раз."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const navLinks = [
    { label: "О нас", target: "about" },
    { label: "Как это работает", target: "process" },
    { label: "Услуги", target: "services" },
    { label: "Статьи", target: "articles" },
    { label: "Цены", target: "pricing" },
    { label: "Контакты", target: "contacts" },
  ];

  const articles = [
    {
      title: "Оценка наследуемости «Большой пятерки»",
      intro:
        "Краткий обзор исследований о том, как генетические и средовые факторы влияют на интеллект, личностные черты и предрасположенность к психическим расстройствам.",
      points: [
        "Генетические факторы могут объяснять значительную долю вариаций в уровне интеллекта, но среда и образование по-прежнему играют ключевую роль.",
        "Наследуемость личностных черт вроде экстраверсии, нейротизма и добросовестности обычно оценивается в диапазоне 40-60%.",
        "Даже при высокой наследуемости психических рисков проявление расстройств зависит от стресса, травматичного опыта и условий жизни.",
      ],
      sourceLabel: "Статья на портале «Наша Психология»",
      sourceHref: "https://www.psyh.ru/geneticheskie-faktory/",
      researchLabel: "Оригинальное исследование Nature",
      researchHref: "https://www.nature.com/articles/tp201596",
    },
    {
      title: "Ученые-психологи объяснили веру в экстрасенсов",
      intro:
        "Материал о психологическом исследовании, в котором сравнивались когнитивные особенности скептиков, нейтральных участников и людей, верящих в паранормальное.",
      points: [
        "Участников разделили на группы по отношению к экстрасенсорике и мистике, а затем протестировали на память, внушаемость и аналитические способности.",
        "По части памяти и податливости ложным воспоминаниям группы оказались довольно близки друг к другу.",
        "Наибольшие различия проявились в логических и аналитических задачах, где скептически настроенные участники справлялись лучше.",
      ],
      sourceLabel: "Статья на портале «Наша Психология»",
      sourceHref:
        "https://www.psyh.ru/uchenye-psihologi-obyasnili-veru-v-ekstrasensov/",
      researchLabel: "Оригинальное исследование Springer",
      researchHref:
        "https://link.springer.com/article/10.3758/s13421-015-0563-x",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* ═══════════════ HEADER ═══════════════ */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? "bg-white/90 backdrop-blur-md shadow-sm border-b border-sage-light/20"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Logo */}
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="flex items-center gap-3 group"
            >
              <img
                src="/favicon.svg"
                alt="Лад"
                className="w-10 h-10 rounded-xl shadow-md group-hover:shadow-lg transition-shadow"
              />
              <span className="text-xl font-bold tracking-tight text-forest">
                Лад
              </span>
            </button>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <button
                  key={link.target}
                  onClick={() => scrollToSection(link.target)}
                  className="px-4 py-2 text-sm font-medium text-forest/70 hover:text-forest rounded-lg hover:bg-sage-light/20 transition-all duration-300"
                >
                  {link.label}
                </button>
              ))}
              <Button
                onClick={() => scrollToSection("booking")}
                className="ml-3 bg-gradient-to-r from-sage to-sage-dark hover:from-sage-dark hover:to-forest text-white border-0 rounded-xl shadow-md hover:shadow-lg transition-all duration-300"
              >
                Записаться
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </nav>

            {/* Mobile Menu Toggle */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-sage-light/20 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6 text-forest" />
              ) : (
                <Menu className="w-6 h-6 text-forest" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        <div
          className={`md:hidden transition-all duration-300 overflow-hidden ${
            mobileMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="bg-white/95 backdrop-blur-md border-t border-sage-light/20 px-4 py-4 space-y-1">
            {navLinks.map((link) => (
              <button
                key={link.target}
                onClick={() => scrollToSection(link.target)}
                className="block w-full text-left px-4 py-3 text-sm font-medium text-forest/70 hover:text-forest rounded-lg hover:bg-sage-light/20 transition-all"
              >
                {link.label}
              </button>
            ))}
            <Button
              onClick={() => scrollToSection("booking")}
              className="w-full mt-2 bg-gradient-to-r from-sage to-sage-dark text-white border-0 rounded-xl"
            >
              Записаться на приём
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* ═══════════════ HERO SECTION ═══════════════ */}
        <section className="relative min-h-screen flex items-center overflow-hidden">
          {/* Background */}
          <div className="absolute inset-0">
            <div
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{ backgroundImage: "url('/hero-original.png')" }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-cream/95 via-cream/85 to-cream/60" />
            {/* Decorative elements */}
            <div className="absolute top-20 right-10 w-72 h-72 bg-sage-light/20 rounded-full blur-3xl animate-float" />
            <div className="absolute bottom-20 left-10 w-96 h-96 bg-sage/10 rounded-full blur-3xl animate-float animation-delay-400" />
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 sm:py-40">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              {/* Left: Text */}
              <div className="space-y-8">
                <div className="animate-fade-in-up">
                  <span className="inline-flex items-center gap-2 px-4 py-2 bg-sage-light/30 text-sage-dark text-sm font-medium rounded-full border border-sage-light/40">
                    <Sparkles className="w-4 h-4" />
                    Психологические консультации
                  </span>
                </div>

                <h1 className="animate-fade-in-up animation-delay-200 text-4xl sm:text-5xl lg:text-6xl font-bold text-forest leading-tight">
                  Ваше ментальное
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-sage to-sage-dark">
                    здоровье —
                  </span>
                  наша цель
                </h1>

                <p className="animate-fade-in-up animation-delay-400 text-lg sm:text-xl text-forest/60 max-w-lg leading-relaxed">
                  Добро пожаловать! Мы — команда профессиональных психологов, готовых помочь вам
                  справиться с жизненными трудностями и обрести внутреннюю гармонию.
                </p>

                <div className="animate-fade-in-up animation-delay-600 flex flex-wrap gap-4">
                  <Button
                    size="lg"
                    onClick={() => scrollToSection("booking")}
                    className="bg-gradient-to-r from-sage to-sage-dark hover:from-sage-dark hover:to-forest text-white border-0 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 px-8 py-6 text-base"
                  >
                    Записаться на консультацию
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={() => scrollToSection("process")}
                    className="border-2 border-sage-light text-forest hover:bg-sage-light/20 rounded-xl px-8 py-6 text-base"
                  >
                    Как это работает
                  </Button>
                </div>

                {/* Quick Stats */}
                <div className="animate-fade-in-up animation-delay-800 flex gap-8 pt-4">
                  {[
                    { icon: Shield, label: "Анонимность" },
                    { icon: Users, label: "Дипломированные специалисты" },
                    { icon: Clock, label: "Онлайн-формат" },
                  ].map((stat, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-forest/50">
                      <stat.icon className="w-4 h-4 text-sage" />
                      <span className="hidden sm:inline">{stat.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right: Decorative Card */}
              <div className="hidden lg:flex justify-center">
                <div className="relative">
                  <div className="w-80 h-96 rounded-3xl bg-gradient-to-br from-sage-light/40 to-sage/20 backdrop-blur-sm border border-sage-light/30 shadow-2xl p-8 flex flex-col justify-between animate-float">
                    <div>
                      <div className="w-16 h-16 rounded-2xl bg-white/60 backdrop-blur-sm flex items-center justify-center mb-6 shadow-lg">
                        <Heart className="w-8 h-8 text-sage-dark" />
                      </div>
                      <h3 className="text-xl font-bold text-forest mb-3">
                        Начните путь к себе
                      </h3>
                      <p className="text-forest/60 text-sm leading-relaxed">
                        Первый шаг к изменениям — это признание необходимости помощи. Мы рядом.
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className="w-5 h-5 text-amber-400 fill-amber-400"
                        />
                      ))}
                    </div>
                  </div>
                  {/* Floating mini card */}
                  <div className="absolute -bottom-4 -left-8 w-48 bg-white rounded-2xl shadow-xl border border-sage-light/20 p-4 animate-float animation-delay-400">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-xs text-forest/50">Более</p>
                        <p className="text-sm font-bold text-forest">1000+ клиентов</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
            <ChevronDown className="w-6 h-6 text-sage/50" />
          </div>
        </section>

        {/* ═══════════════ MESSENGERS ═══════════════ */}
        <section className="py-16 bg-gradient-to-r from-sage to-sage-dark relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-1/4 w-64 h-64 bg-white rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-white rounded-full blur-3xl" />
          </div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="text-center sm:text-left">
                <h3 className="text-xl font-bold text-white mb-1">
                  Свяжитесь с нами в удобном мессенджере
                </h3>
                <p className="text-white/70 text-sm">
                  Telegram, WhatsApp, VK, Discord — выберите свой вариант
                </p>
              </div>
              <div className="flex items-center gap-3">
                {[
                  {
                    Icon: TelegramIcon,
                    label: "Telegram",
                    href: "#",
                    color: "hover:bg-white/30",
                  },
                  {
                    Icon: WhatsAppIcon,
                    label: "WhatsApp",
                    href: "#",
                    color: "hover:bg-white/30",
                  },
                  { Icon: VKIcon, label: "VK", href: "#", color: "hover:bg-white/30" },
                  {
                    Icon: DiscordIcon,
                    label: "Discord",
                    href: "#",
                    color: "hover:bg-white/30",
                  },
                ].map(({ Icon, label, href, color }) => (
                  <a
                    key={label}
                    href={href}
                    className={`w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm ${color} flex items-center justify-center text-white transition-all duration-300 border border-white/10 hover:border-white/30 hover:scale-110`}
                    aria-label={label}
                    title={label}
                  >
                    <Icon size={22} />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════ HOW IT WORKS ═══════════════ */}
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
              {[
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
              ].map((item, i) => (
                <FadeIn key={i} delay={i * 150}>
                  <div className="relative group">
                    {/* Connector line */}
                    {i < 3 && (
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

        {/* ═══════════════ SERVICES ═══════════════ */}
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
              {[
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
              ].map((service, i) => (
                <FadeIn key={i} delay={i * 100}>
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

        {/* ═══════════════ ABOUT ═══════════════ */}
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
                  {/* Floating badge */}
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
                    Мы — небольшая команда дипломированных психологов, специализирующихся на
                    работе с людьми и их психологическими трудностями. Каждый из нашей команды
                    работает непосредственно по своей специальности.
                  </p>
                  <p className="text-forest/60 leading-relaxed">
                    Данный ресурс был создан исключительно для работы с клиентами, у которых
                    есть реальные психологические трудности. Мы не продаём ложные иллюзии,
                    религиозную тематику, инфо-курсы и эзотерические практики.
                  </p>

                  {/* Rules */}
                  <div className="bg-cream rounded-2xl p-6 border border-sage-light/20">
                    <h4 className="text-sm font-bold text-forest mb-4 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-sage-dark" />
                      Наши принципы
                    </h4>
                    <ul className="space-y-3">
                      {[
                        "Полная анонимность всех записей",
                        "Удаление данных по вашему желанию",
                        "Соблюдение ФЗ-152 и других законов о защите данных",
                        "Никакой ответственности за ваши действия",
                        "Защита информации от третьих лиц",
                      ].map((rule, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-3 text-sm text-forest/60"
                        >
                          <Leaf className="w-4 h-4 text-sage mt-0.5 flex-shrink-0" />
                          <span>{rule}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* What we don't do */}
                  <div className="bg-sage-light/10 rounded-2xl p-6 border border-sage-light/20">
                    <h4 className="text-sm font-bold text-forest/70 mb-3">
                      На этом сайте вы НЕ найдёте:
                    </h4>
                    <div className="grid sm:grid-cols-2 gap-2">
                      {[
                        "Магические шары и карты таро",
                        "«10 правил успеха»",
                        "Эзотерические практики",
                        "Инфо-курсы и тренинги",
                      ].map((item, i) => (
                        <p
                          key={i}
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

        <section
          id="articles"
          className="py-24 sm:py-32 bg-[linear-gradient(180deg,_#ffffff_0%,_#f8f4ec_100%)]"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <FadeIn>
              <div className="max-w-3xl mb-16">
                <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-sage-light/20 text-sage-dark text-xs font-semibold uppercase tracking-wider rounded-full mb-4">
                  <BookOpen className="w-4 h-4" />
                  Статьи
                </span>
                <h2 className="text-3xl sm:text-4xl font-bold text-forest mb-4">
                  Материалы по психологии и научным исследованиям
                </h2>
                <p className="text-forest/55 leading-relaxed">
                  Подобрали несколько материалов, которые помогают лучше понять
                  влияние наследуемости, среды и особенностей мышления на
                  психологическое состояние человека.
                </p>
              </div>
            </FadeIn>

            <div className="grid xl:grid-cols-2 gap-8">
              {articles.map((article, index) => (
                <FadeIn key={article.title} delay={index * 140}>
                  <article className="h-full rounded-[2rem] border border-sage-light/20 bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                    <div className="flex items-start justify-between gap-4 mb-6">
                      <div>
                        <p className="text-xs uppercase tracking-[0.3em] text-sage-dark/80 mb-3">
                          Обзор исследований
                        </p>
                        <h3 className="text-2xl font-bold text-forest leading-tight">
                          {article.title}
                        </h3>
                      </div>
                      <div className="hidden sm:flex w-14 h-14 rounded-2xl bg-gradient-to-br from-sage-light/45 to-sage/15 items-center justify-center flex-shrink-0">
                        <BookOpen className="w-7 h-7 text-sage-dark" />
                      </div>
                    </div>

                    <p className="text-forest/60 leading-relaxed mb-6">
                      {article.intro}
                    </p>

                    <ul className="space-y-4 mb-8">
                      {article.points.map((point) => (
                        <li
                          key={point}
                          className="flex items-start gap-3 text-sm leading-6 text-forest/65"
                        >
                          <Leaf className="w-4 h-4 text-sage mt-1 flex-shrink-0" />
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="rounded-2xl bg-cream p-5 border border-sage-light/20">
                      <p className="text-xs uppercase tracking-[0.25em] text-forest/35 mb-4">
                        Источники
                      </p>
                      <div className="flex flex-col gap-3">
                        <a
                          href={article.sourceHref}
                          target="_blank"
                          rel="noreferrer"
                          className="group inline-flex items-center justify-between gap-3 rounded-xl bg-white px-4 py-3 text-sm font-medium text-forest ring-1 ring-sage-light/20 transition hover:ring-sage/40"
                        >
                          <span>{article.sourceLabel}</span>
                          <ArrowRight className="w-4 h-4 text-sage-dark transition-transform group-hover:translate-x-1" />
                        </a>
                        <a
                          href={article.researchHref}
                          target="_blank"
                          rel="noreferrer"
                          className="group inline-flex items-center justify-between gap-3 rounded-xl bg-white px-4 py-3 text-sm font-medium text-forest ring-1 ring-sage-light/20 transition hover:ring-sage/40"
                        >
                          <span>{article.researchLabel}</span>
                          <ArrowRight className="w-4 h-4 text-sage-dark transition-transform group-hover:translate-x-1" />
                        </a>
                      </div>
                    </div>
                  </article>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════ PRICING ═══════════════ */}
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
              {[
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
              ].map((plan, i) => (
                <FadeIn key={i} delay={i * 80}>
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

        {/* ═══════════════ BOOKING FORM ═══════════════ */}
        <section id="booking" className="py-24 sm:py-32 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
              <FadeIn>
                <div className="space-y-8">
                  <div>
                    <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-sage-light/20 text-sage-dark text-xs font-semibold uppercase tracking-wider rounded-full mb-4">
                      Запись
                    </span>
                    <h2 className="text-3xl sm:text-4xl font-bold text-forest mb-4">
                      Запишитесь на консультацию
                    </h2>
                    <p className="text-forest/50 leading-relaxed">
                      Заполните форму ниже, и мы свяжемся с вами в ближайшее время
                      для назначения консультации. Все данные защищены.
                    </p>
                  </div>

                  {/* Contact info cards */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 p-4 bg-cream rounded-xl border border-sage-light/20">
                      <div className="w-12 h-12 rounded-xl bg-sage-light/30 flex items-center justify-center flex-shrink-0">
                        <Phone className="w-5 h-5 text-sage-dark" />
                      </div>
                      <div>
                        <p className="text-xs text-forest/40 mb-0.5">Телефон</p>
                        <p className="text-sm font-semibold text-forest">
                          +7 (978) 293-95-29
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 p-4 bg-cream rounded-xl border border-sage-light/20">
                      <div className="w-12 h-12 rounded-xl bg-sage-light/30 flex items-center justify-center flex-shrink-0">
                        <Mail className="w-5 h-5 text-sage-dark" />
                      </div>
                      <div>
                        <p className="text-xs text-forest/40 mb-0.5">Электронная почта</p>
                        <p className="text-sm font-semibold text-forest break-all">
                          lad.psychologicalconsultations@mail.ru
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 p-4 bg-cream rounded-xl border border-sage-light/20">
                      <div className="w-12 h-12 rounded-xl bg-sage-light/30 flex items-center justify-center flex-shrink-0">
                        <MapPin className="w-5 h-5 text-sage-dark" />
                      </div>
                      <div>
                        <p className="text-xs text-forest/40 mb-0.5">Формат</p>
                        <p className="text-sm font-semibold text-forest">
                          Онлайн-консультации
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </FadeIn>

              <FadeIn delay={200}>
                <div className="bg-cream rounded-3xl p-6 sm:p-10 border border-sage-light/20 shadow-sm">
                  {submittedApplicationNumber ? (
                    <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center space-y-4">
                      <div className="w-20 h-20 rounded-full bg-sage-light/40 flex items-center justify-center">
                        <CheckCircle2 className="w-10 h-10 text-sage-dark" />
                      </div>
                      <h3 className="text-2xl font-bold text-forest">
                        Заявка отправлена!
                      </h3>
                      <p className="text-forest/50 max-w-sm">
                        Мы свяжемся с вами в ближайшее время для назначения консультации.
                        Спасибо за доверие!
                      </p>
                      <div className="rounded-2xl bg-white px-5 py-4 shadow-sm ring-1 ring-sage-light/20">
                        <p className="text-xs uppercase tracking-[0.3em] text-forest/35">
                          Номер заявки
                        </p>
                        <p className="mt-2 text-2xl font-bold text-sage-dark">
                          {submittedApplicationNumber}
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setSubmittedApplicationNumber("")}
                        className="rounded-xl border-sage-light/30 bg-white hover:bg-sage-light/10"
                      >
                        Отправить еще одну заявку
                      </Button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="space-y-2">
                        <Label
                          htmlFor="name"
                          className="text-sm font-medium text-forest"
                        >
                          Ваше имя (псевдоним)
                        </Label>
                        <Input
                          id="name"
                          placeholder="Как к вам обращаться?"
                          required
                          value={formData.name}
                          onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
                          }
                          className="bg-white border-sage-light/30 focus:border-sage rounded-xl h-12 px-4 text-forest placeholder:text-forest/30"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="email"
                          className="text-sm font-medium text-forest"
                        >
                          Email (почта)
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="your@email.com"
                          required
                          value={formData.email}
                          onChange={(e) =>
                            setFormData({ ...formData, email: e.target.value })
                          }
                          className="bg-white border-sage-light/30 focus:border-sage rounded-xl h-12 px-4 text-forest placeholder:text-forest/30"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="phone"
                          className="text-sm font-medium text-forest"
                        >
                          Телефон для обратной связи
                        </Label>
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="+7 (___) ___-__-__"
                          required
                          value={formData.phone}
                          onChange={(e) =>
                            setFormData({ ...formData, phone: e.target.value })
                          }
                          className="bg-white border-sage-light/30 focus:border-sage rounded-xl h-12 px-4 text-forest placeholder:text-forest/30"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="reason"
                          className="text-sm font-medium text-forest"
                        >
                          Причина обращения
                        </Label>
                        <Textarea
                          id="reason"
                          placeholder="Опишите, что вас беспокоит (по возможности)..."
                          rows={4}
                          value={formData.reason}
                          onChange={(e) =>
                            setFormData({ ...formData, reason: e.target.value })
                          }
                          className="bg-white border-sage-light/30 focus:border-sage rounded-xl px-4 py-3 text-forest placeholder:text-forest/30 resize-none"
                        />
                      </div>

                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-gradient-to-r from-sage to-sage-dark hover:from-sage-dark hover:to-forest text-white border-0 rounded-xl h-12 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                      >
                        {isSubmitting ? (
                          <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Send className="w-4 h-4 mr-2" />
                        )}
                        Отправить заявку
                      </Button>

                      {submitError ? (
                        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
                          {submitError}
                        </p>
                      ) : null}

                      <p className="text-xs text-forest/30 text-center leading-relaxed">
                        Нажимая кнопку, вы соглашаетесь с правилами нашего сервиса.
                        Ваши данные защищены в соответствии с ФЗ-152.
                      </p>
                    </form>
                  )}
                </div>
              </FadeIn>
            </div>
          </div>
        </section>
      </main>

      {/* ═══════════════ FOOTER ═══════════════ */}
      <footer id="contacts" className="bg-forest text-white/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10">
            {/* Brand */}
            <div className="sm:col-span-2 lg:col-span-1">
              <div className="flex items-center gap-3 mb-4">
                <img
                  src="/favicon.svg"
                  alt="Лад"
                  className="w-10 h-10 rounded-xl"
                />
                <span className="text-xl font-bold text-white">Лад</span>
              </div>
              <p className="text-white/50 text-sm leading-relaxed">
                Профессиональные психологические консультации онлайн.
                Ваш ментальное здоровье — наш приоритет.
              </p>
            </div>

            {/* Navigation */}
            <div>
              <h4 className="text-sm font-semibold text-white mb-4">Навигация</h4>
              <ul className="space-y-2">
                {navLinks.map((link) => (
                  <li key={link.target}>
                    <button
                      onClick={() => scrollToSection(link.target)}
                      className="text-sm text-white/50 hover:text-white transition-colors"
                    >
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Services */}
            <div>
              <h4 className="text-sm font-semibold text-white mb-4">Услуги</h4>
              <ul className="space-y-2">
                {[
                  "Стресс и тревога",
                  "Депрессия",
                  "Семейное консультирование",
                  "ПТСР",
                  "Детская психология",
                ].map((service) => (
                  <li key={service}>
                    <span className="text-sm text-white/50">{service}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contacts */}
            <div>
              <h4 className="text-sm font-semibold text-white mb-4">Контакты</h4>
              <ul className="space-y-3">
                <li>
                  <a
                    href="tel:+79782939529"
                    className="flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors"
                  >
                    <Phone className="w-4 h-4" />
                    +7 (978) 293-95-29
                  </a>
                </li>
                <li>
                  <a
                    href="mailto:lad.psychologicalconsultations@mail.ru"
                    className="flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors break-all"
                  >
                    <Mail className="w-4 h-4 flex-shrink-0" />
                    lad.psychologicalconsultations@mail.ru
                  </a>
                </li>
                <li className="flex gap-3 pt-2">
                  {[
                    { Icon: TelegramIcon, href: "#" },
                    { Icon: WhatsAppIcon, href: "#" },
                    { Icon: VKIcon, href: "#" },
                    { Icon: DiscordIcon, href: "#" },
                  ].map(({ Icon, href }, i) => (
                    <a
                      key={i}
                      href={href}
                      className="w-9 h-9 rounded-lg bg-white/10 hover:bg-sage/50 flex items-center justify-center text-white/60 hover:text-white transition-all duration-300"
                    >
                      <Icon size={18} />
                    </a>
                  ))}
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-white/30">
              © {new Date().getFullYear()} Лад — Психологические консультации. Все права защищены.
            </p>
            <p className="text-xs text-white/30">
              Защита персональных данных по ФЗ-152
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
