"use client";

import type React from "react";
import { useCallback, useRef } from "react";

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
import type { HomeContactsContent, HomePageContent } from "@/lib/content";

import { FadeIn } from "./fade-in";

export type BookingFormData = {
  name: string;
  email: string;
  phone: string;
  reason: string;
};

type BookingSectionProps = {
  content: HomePageContent;
  contacts: HomeContactsContent;
  formData: BookingFormData;
  isSubmitting: boolean;
  submitError: string;
  submittedApplicationNumber: string;
  onSubmit: (event: React.FormEvent) => Promise<void>;
  onResetSuccess: () => void;
  onFieldChange: (field: keyof BookingFormData, value: string) => void;
};

export function BookingSection({
  content,
  contacts,
  formData,
  isSubmitting,
  submitError,
  submittedApplicationNumber,
  onSubmit,
  onResetSuccess,
  onFieldChange,
}: BookingSectionProps) {
  const phoneTextRef = useRef<HTMLParagraphElement | null>(null);
  const emailTextRef = useRef<HTMLParagraphElement | null>(null);

  const selectText = useCallback((node: HTMLElement | null) => {
    if (!node) {
      return;
    }

    const selection = window.getSelection();
    if (!selection) {
      return;
    }

    const range = document.createRange();
    range.selectNodeContents(node);
    selection.removeAllRanges();
    selection.addRange(range);
  }, []);

  return (
    <section id="booking" className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
          <FadeIn>
            <div className="space-y-8">
              <div>
                <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-sage-light/20 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-sage-dark">
                  Запись
                </span>
                <h2 className="mb-4 text-3xl font-bold text-forest sm:text-4xl">
                  {content.bookingTitle}
                </h2>
                <p className="leading-relaxed text-forest/50">
                  {content.bookingDescription}
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-4 rounded-xl border border-sage-light/20 bg-cream p-4">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-sage-light/30">
                    <Phone className="h-5 w-5 text-sage-dark" />
                  </div>
                  <div>
                    <p className="mb-0.5 text-xs text-forest/40">Телефон</p>
                    <p
                      ref={phoneTextRef}
                      onDoubleClick={() => selectText(phoneTextRef.current)}
                      className="select-text text-sm font-semibold text-forest"
                    >
                      {contacts.phone}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 rounded-xl border border-sage-light/20 bg-cream p-4">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-sage-light/30">
                    <Mail className="h-5 w-5 text-sage-dark" />
                  </div>
                  <div>
                    <p className="mb-0.5 text-xs text-forest/40">
                      Электронная почта
                    </p>
                    <p
                      ref={emailTextRef}
                      onDoubleClick={() => selectText(emailTextRef.current)}
                      className="select-text break-all text-sm font-semibold text-forest"
                    >
                      {contacts.email}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 rounded-xl border border-sage-light/20 bg-cream p-4">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-sage-light/30">
                    <MapPin className="h-5 w-5 text-sage-dark" />
                  </div>
                  <div>
                    <p className="mb-0.5 text-xs text-forest/40">Формат</p>
                    <p className="text-sm font-semibold text-forest">
                      {contacts.formatLabel}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>

          <FadeIn delay={200}>
            <div className="rounded-3xl border border-sage-light/20 bg-cream p-6 shadow-sm sm:p-10">
              {submittedApplicationNumber ? (
                <div className="flex min-h-[400px] h-full flex-col items-center justify-center space-y-4 text-center">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-sage-light/40">
                    <CheckCircle2 className="h-10 w-10 text-sage-dark" />
                  </div>
                  <h3 className="text-2xl font-bold text-forest">
                    Заявка отправлена
                  </h3>
                  <p className="max-w-sm text-forest/50">
                    Мы свяжемся с вами в ближайшее время для назначения
                    консультации. Спасибо за доверие.
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
                      Ваше имя
                    </Label>
                    <Input
                      id="name"
                      placeholder="Как к вам обращаться?"
                      required
                      value={formData.name}
                      onChange={(event) =>
                        onFieldChange("name", event.target.value)
                      }
                      className="h-12 select-text rounded-xl border-sage-light/30 bg-white px-4 text-forest placeholder:text-forest/30 focus:border-sage"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium text-forest">
                      Email
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
                      className="h-12 select-text rounded-xl border-sage-light/30 bg-white px-4 text-forest placeholder:text-forest/30 focus:border-sage"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm font-medium text-forest">
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
                      className="h-12 select-text rounded-xl border-sage-light/30 bg-white px-4 text-forest placeholder:text-forest/30 focus:border-sage"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reason" className="text-sm font-medium text-forest">
                      Причина обращения
                    </Label>
                    <Textarea
                      id="reason"
                      placeholder="Опишите, что вас беспокоит..."
                      rows={4}
                      value={formData.reason}
                      onChange={(event) =>
                        onFieldChange("reason", event.target.value)
                      }
                      className="resize-none select-text rounded-xl border-sage-light/30 bg-white px-4 py-3 text-forest placeholder:text-forest/30 focus:border-sage"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="h-12 w-full rounded-xl border-0 bg-gradient-to-r from-sage to-sage-dark text-base font-semibold text-white shadow-lg transition-all duration-300 hover:from-sage-dark hover:to-forest hover:shadow-xl"
                  >
                    {isSubmitting ? (
                      <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="mr-2 h-4 w-4" />
                    )}
                    Отправить заявку
                  </Button>

                  {submitError ? (
                    <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
                      {submitError}
                    </p>
                  ) : null}

                  <p className="text-center text-xs leading-relaxed text-forest/30">
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
