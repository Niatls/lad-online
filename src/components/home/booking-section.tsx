"use client";

import type React from "react";

import {
  CheckCircle2,
  LoaderCircle,
  Mail,
  MapPin,
  Phone,
  Send,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { FadeIn } from "./fade-in";

export type BookingFormData = {
  name: string;
  email: string;
  phone: string;
  reason: string;
};

type BookingSectionProps = {
  formData: BookingFormData;
  isSubmitting: boolean;
  submitError: string;
  submittedApplicationNumber: string;
  onSubmit: (event: React.FormEvent) => Promise<void>;
  onResetSuccess: () => void;
  onFieldChange: (field: keyof BookingFormData, value: string) => void;
};

export function BookingSection({
  formData,
  isSubmitting,
  submitError,
  submittedApplicationNumber,
  onSubmit,
  onResetSuccess,
  onFieldChange,
}: BookingSectionProps) {
  return (
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
                    <p className="text-xs text-forest/40 mb-0.5">
                      Электронная почта
                    </p>
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
                    Мы свяжемся с вами в ближайшее время для назначения
                    консультации. Спасибо за доверие!
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
                    onClick={onResetSuccess}
                    className="rounded-xl border-sage-light/30 bg-white hover:bg-sage-light/10"
                  >
                    Отправить еще одну заявку
                  </Button>
                </div>
              ) : (
                <form onSubmit={onSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium text-forest">
                      Ваше имя (псевдоним)
                    </Label>
                    <Input
                      id="name"
                      placeholder="Как к вам обращаться?"
                      required
                      value={formData.name}
                      onChange={(event) =>
                        onFieldChange("name", event.target.value)
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
                      onChange={(event) =>
                        onFieldChange("email", event.target.value)
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
                      onChange={(event) =>
                        onFieldChange("phone", event.target.value)
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
                      onChange={(event) =>
                        onFieldChange("reason", event.target.value)
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
  );
}
