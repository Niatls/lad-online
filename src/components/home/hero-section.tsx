"use client";

import {
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  Clock,
  Heart,
  Shield,
  Sparkles,
  Star,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";

type HeroSectionProps = {
  onScrollToSection: (id: string) => void;
};

const heroStats = [
  { icon: Shield, label: "Анонимность" },
  { icon: Users, label: "Дипломированные специалисты" },
  { icon: Clock, label: "Онлайн-формат" },
];

export function HeroSection({ onScrollToSection }: HeroSectionProps) {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      <div className="absolute inset-0">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/hero-original.png')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-cream/95 via-cream/85 to-cream/60" />
        <div className="absolute top-20 right-10 w-72 h-72 bg-sage-light/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-sage/10 rounded-full blur-3xl animate-float animation-delay-400" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 sm:py-40">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
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
              Добро пожаловать! Мы — команда профессиональных психологов,
              готовых помочь вам справиться с жизненными трудностями и обрести
              внутреннюю гармонию.
            </p>

            <div className="animate-fade-in-up animation-delay-600 flex flex-wrap gap-4">
              <Button
                size="lg"
                onClick={() => onScrollToSection("booking")}
                className="bg-gradient-to-r from-sage to-sage-dark hover:from-sage-dark hover:to-forest text-white border-0 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 px-8 py-6 text-base"
              >
                Записаться на консультацию
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => onScrollToSection("process")}
                className="border-2 border-sage-light text-forest hover:bg-sage-light/20 rounded-xl px-8 py-6 text-base"
              >
                Как это работает
              </Button>
            </div>

            <div className="animate-fade-in-up animation-delay-800 flex gap-8 pt-4">
              {heroStats.map((stat) => (
                <div
                  key={stat.label}
                  className="flex items-center gap-2 text-sm text-forest/50"
                >
                  <stat.icon className="w-4 h-4 text-sage" />
                  <span className="hidden sm:inline">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>

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
                    Первый шаг к изменениям — это признание необходимости помощи.
                    Мы рядом.
                  </p>
                </div>
                <div className="flex gap-2">
                  {[...Array(5)].map((_, index) => (
                    <Star
                      key={index}
                      className="w-5 h-5 text-amber-400 fill-amber-400"
                    />
                  ))}
                </div>
              </div>

              <div className="absolute -bottom-4 -left-8 w-48 bg-white rounded-2xl shadow-xl border border-sage-light/20 p-4 animate-float animation-delay-400">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-forest/50">Более</p>
                    <p className="text-sm font-bold text-forest">
                      1000+ клиентов
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <ChevronDown className="w-6 h-6 text-sage/50" />
      </div>
    </section>
  );
}
