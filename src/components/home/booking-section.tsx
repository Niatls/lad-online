"use client";

import type React from "react";
import { useEffect, useRef, useState } from "react";

import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  LoaderCircle,
  Mail,
  MapPin,
  Phone,
  Send,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { applicationContactMethods } from "@/lib/applications";
import type { HomeContactsContent, HomePageContent } from "@/lib/content";

import { FadeIn } from "./fade-in";

const genderOptions = [
  { value: "male", label: "Мужской" },
  { value: "female", label: "Женский" },
] as const;

const timeOptions = ["00", "15", "30", "45"] as const;

const hourOptions = [
  "09",
  "10",
  "11",
  "12",
  "13",
  "14",
  "15",
  "16",
  "17",
  "18",
  "19",
  "20",
  "21",
] as const;

function formatBookingDate(date?: Date) {
  if (!date) {
    return "";
  }

  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

function parsePreferredTimeValue(value: string) {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/);

  if (!match) {
    return {
      date: undefined as Date | undefined,
      time: "",
    };
  }

  return {
    date: new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3])),
    time: `${match[4]}:${match[5]}`,
  };
}

function buildPreferredTimeValue(date?: Date, time?: string) {
  if (!date || !time) {
    return "";
  }

  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");

  return `${year}-${month}-${day}T${time}`;
}

export type BookingFormData = {
  name: string;
  gender: string;
  age: string;
  email: string;
  phone: string;
  preferredTime: string;
  reason: string;
  contactMethod: string;
};

export type BookingSubmissionResult = {
  applicationNumber: string;
  contactHref: string;
  contactMethod: string;
  preferredTime: string;
};

type BookingSectionProps = {
  content: HomePageContent;
  contacts: HomeContactsContent;
  formData: BookingFormData;
  isSubmitting: boolean;
  submitError: string;
  submittedApplication: BookingSubmissionResult | null;
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
  submittedApplication,
  onSubmit,
  onResetSuccess,
  onFieldChange,
}: BookingSectionProps) {
  const phoneTextRef = useRef<HTMLParagraphElement | null>(null);
  const emailTextRef = useRef<HTMLParagraphElement | null>(null);
  const [codeCopied, setCodeCopied] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState("");
  const [calendarOpen, setCalendarOpen] = useState(false);

  useEffect(() => {
    const parsedValue = parsePreferredTimeValue(formData.preferredTime);
    setSelectedDate(parsedValue.date);
    setSelectedTime(parsedValue.time);
  }, [formData.preferredTime]);

  const activateCopyTarget = (node: HTMLElement | null) => {
    if (!node) {
      return;
    }

    document
      .querySelectorAll<HTMLElement>("[data-copy-active='true']")
      .forEach((element) => {
        element.dataset.copyActive = "false";
      });

    node.dataset.copyActive = "true";
  };

  const copyApplicationCode = async () => {
    if (!submittedApplication?.applicationNumber) {
      return;
    }

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(
          submittedApplication.applicationNumber,
        );
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = submittedApplication.applicationNumber;
        textarea.setAttribute("readonly", "true");
        textarea.style.position = "fixed";
        textarea.style.left = "-9999px";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }

      setCodeCopied(true);
      window.setTimeout(() => setCodeCopied(false), 1800);
    } catch {
      setCodeCopied(false);
    }
  };

  const syncPreferredTime = (date?: Date, time?: string) => {
    setSelectedDate(date);
    setSelectedTime(time ?? "");
    onFieldChange("preferredTime", buildPreferredTimeValue(date, time));
  };

  const selectedHour = selectedTime ? selectedTime.split(":")[0] : "";
  const selectedMinute = selectedTime ? selectedTime.split(":")[1] : "";

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
                      onMouseDown={(event) => event.preventDefault()}
                      onDoubleClick={() =>
                        activateCopyTarget(phoneTextRef.current)
                      }
                      data-copy-text={contacts.phone}
                      data-copy-active="false"
                      className="select-none text-sm font-semibold text-forest data-[copy-active=true]:rounded-md data-[copy-active=true]:bg-sage-light/40 data-[copy-active=true]:px-1.5 data-[copy-active=true]:py-0.5"
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
                      onMouseDown={(event) => event.preventDefault()}
                      onDoubleClick={() =>
                        activateCopyTarget(emailTextRef.current)
                      }
                      data-copy-text={contacts.email}
                      data-copy-active="false"
                      className="select-none break-all text-sm font-semibold text-forest data-[copy-active=true]:rounded-md data-[copy-active=true]:bg-sage-light/40 data-[copy-active=true]:px-1.5 data-[copy-active=true]:py-0.5"
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
              {submittedApplication ? (
                <div className="flex min-h-[400px] h-full flex-col items-center justify-center space-y-4 text-center">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-sage-light/40">
                    <CheckCircle2 className="h-10 w-10 text-sage-dark" />
                  </div>
                  <h3 className="text-2xl font-bold text-forest">
                    Заявка отправлена
                  </h3>
                  <p className="max-w-sm text-forest/50">
                    За 20 минут до назначенного времени отправьте код в
                    выбранный способ связи.
                  </p>
                  <button
                    type="button"
                    onClick={copyApplicationCode}
                    className="rounded-2xl bg-white px-5 py-4 text-center shadow-sm ring-1 ring-sage-light/20 transition hover:bg-sage-light/10 focus:outline-none focus:ring-2 focus:ring-sage"
                  >
                    <p className="text-xs uppercase tracking-[0.3em] text-forest/35">
                      Код заявки
                    </p>
                    <p className="mt-2 text-2xl font-bold text-sage-dark">
                      {submittedApplication.applicationNumber}
                    </p>
                    <p className="mt-2 text-xs text-forest/45">
                      {codeCopied
                        ? "Скопировано"
                        : "Нажмите, чтобы скопировать"}
                    </p>
                  </button>
                  <p className="max-w-sm text-sm text-forest/50">
                    Запись: {submittedApplication.preferredTime}. Канал:{" "}
                    {submittedApplication.contactMethod}.
                  </p>
                  <a
                    href={submittedApplication.contactHref}
                    target={
                      submittedApplication.contactHref.startsWith("#")
                        ? undefined
                        : "_blank"
                    }
                    rel="noreferrer"
                    className="inline-flex h-12 items-center justify-center rounded-xl bg-sage px-5 text-sm font-semibold text-white transition hover:bg-sage-dark"
                  >
                    Перейти в {submittedApplication.contactMethod}
                  </a>
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
                    <Label
                      htmlFor="name"
                      className="text-sm font-medium text-forest"
                    >
                      Как к вам обращаться
                    </Label>
                    <Input
                      id="name"
                      placeholder="Имя или псевдоним"
                      required
                      value={formData.name}
                      onChange={(event) =>
                        onFieldChange("name", event.target.value)
                      }
                      className="h-12 select-text rounded-xl border-sage-light/30 bg-white px-4 text-forest placeholder:text-forest/30 focus:border-sage"
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-forest">
                        Пол
                      </Label>
                      <RadioGroup
                        value={formData.gender}
                        onValueChange={(value) =>
                          onFieldChange("gender", value)
                        }
                        className="grid grid-cols-2 gap-3"
                      >
                        {genderOptions.map((option) => (
                          <label
                            key={option.value}
                            className="flex cursor-pointer items-center gap-3 rounded-xl border border-sage-light/30 bg-white px-4 py-3 text-sm font-medium text-forest transition hover:border-sage"
                          >
                            <RadioGroupItem
                              value={option.value}
                              id={option.value}
                            />
                            <span>{option.label}</span>
                          </label>
                        ))}
                      </RadioGroup>
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="age"
                        className="text-sm font-medium text-forest"
                      >
                        Возраст
                      </Label>
                      <Input
                        id="age"
                        type="number"
                        min={12}
                        max={120}
                        placeholder="Например: 32"
                        required
                        value={formData.age}
                        onChange={(event) =>
                          onFieldChange("age", event.target.value)
                        }
                        className="h-12 select-text rounded-xl border-sage-light/30 bg-white px-4 text-forest placeholder:text-forest/30 focus:border-sage"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-forest">
                      Дата и время консультации
                    </Label>
                    <div className="space-y-3">
                      <Popover
                        open={calendarOpen}
                        onOpenChange={setCalendarOpen}
                      >
                        <PopoverTrigger asChild>
                          <Button
                            type="button"
                            variant="outline"
                            className="h-12 w-full justify-start rounded-xl border-sage-light/30 bg-white px-4 font-normal text-forest shadow-sm transition hover:bg-sage-light/10"
                          >
                            <CalendarDays className="mr-2 h-4 w-4 text-sage-dark" />
                            {selectedDate
                              ? formatBookingDate(selectedDate)
                              : "Выберите дату консультации"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent
                          align="start"
                          className="w-auto rounded-2xl border-sage-light/30 bg-cream p-2 shadow-xl"
                        >
                          <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={(date) => {
                              syncPreferredTime(date, selectedTime);
                              if (date) {
                                setCalendarOpen(false);
                              }
                            }}
                            disabled={(date) =>
                              date < new Date(new Date().setHours(0, 0, 0, 0))
                            }
                            className="rounded-xl bg-transparent"
                            classNames={{
                              month_caption:
                                "flex items-center justify-center h-8 w-full px-8 text-sm font-semibold text-forest",
                              weekday:
                                "text-forest/45 rounded-md flex-1 text-[0.75rem] font-medium",
                              day: "relative w-full h-full p-0 text-center aspect-square select-none",
                              today: "bg-sage-light/30 text-forest rounded-md",
                            }}
                          />
                        </PopoverContent>
                      </Popover>

                      <div className="grid gap-3 sm:grid-cols-2">
                        <Select
                          value={selectedHour}
                          onValueChange={(value) =>
                            syncPreferredTime(
                              selectedDate,
                              selectedMinute
                                ? `${value}:${selectedMinute}`
                                : "",
                            )
                          }
                          disabled={!selectedDate}
                        >
                          <SelectTrigger className="h-12 rounded-xl border-sage-light/30 bg-white px-4 text-forest shadow-sm focus:border-sage">
                            <div className="flex items-center gap-2">
                              <Clock3 className="h-4 w-4 text-sage-dark" />
                              <SelectValue placeholder="Часы" />
                            </div>
                          </SelectTrigger>
                          <SelectContent>
                            {hourOptions.map((hour) => (
                              <SelectItem key={hour} value={hour}>
                                {hour}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <Select
                          value={selectedMinute}
                          onValueChange={(value) =>
                            syncPreferredTime(
                              selectedDate,
                              selectedHour ? `${selectedHour}:${value}` : "",
                            )
                          }
                          disabled={!selectedDate}
                        >
                          <SelectTrigger className="h-12 rounded-xl border-sage-light/30 bg-white px-4 text-forest shadow-sm focus:border-sage">
                            <div className="flex items-center gap-2">
                              <Clock3 className="h-4 w-4 text-sage-dark" />
                              <SelectValue placeholder="Минуты" />
                            </div>
                          </SelectTrigger>
                          <SelectContent>
                            {timeOptions.map((minute) => (
                              <SelectItem key={minute} value={minute}>
                                {minute}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="contactMethod"
                      className="text-sm font-medium text-forest"
                    >
                      Способ связи
                    </Label>
                    <Select
                      value={formData.contactMethod}
                      onValueChange={(value) =>
                        onFieldChange("contactMethod", value)
                      }
                    >
                      <SelectTrigger
                        id="contactMethod"
                        className="h-12 rounded-xl border-sage-light/30 bg-white px-4 text-forest focus:border-sage"
                      >
                        <SelectValue placeholder="Выберите способ связи" />
                      </SelectTrigger>
                      <SelectContent>
                        {applicationContactMethods.map((method) => (
                          <SelectItem key={method.value} value={method.value}>
                            {method.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label
                        htmlFor="phone"
                        className="text-sm font-medium text-forest"
                      >
                        Телефон по желанию
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+7 (___) ___-__-__"
                        value={formData.phone}
                        onChange={(event) =>
                          onFieldChange("phone", event.target.value)
                        }
                        className="h-12 select-text rounded-xl border-sage-light/30 bg-white px-4 text-forest placeholder:text-forest/30 focus:border-sage"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="email"
                        className="text-sm font-medium text-forest"
                      >
                        Email по желанию
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="your@email.com"
                        value={formData.email}
                        onChange={(event) =>
                          onFieldChange("email", event.target.value)
                        }
                        className="h-12 select-text rounded-xl border-sage-light/30 bg-white px-4 text-forest placeholder:text-forest/30 focus:border-sage"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="reason"
                      className="text-sm font-medium text-forest"
                    >
                      Описание проблемы
                    </Label>
                    <Textarea
                      id="reason"
                      placeholder="Можно кратко: что сейчас беспокоит?"
                      required
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
