"use client";

import type React from "react";
import { useEffect, useMemo, useState } from "react";

import { ChevronLeft, ChevronRight, CalendarDays, LoaderCircle, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type LookupResult = {
  applicationNumber: string;
  contactHref: string;
  contactMethod: string;
  preferredTime: string | null;
};

function formatMoscowDateTime(date: Date) {
  const dateParts = new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    timeZone: "Europe/Moscow",
    year: "numeric",
  }).formatToParts(date);
  const displayParts = new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "long",
    timeZone: "Europe/Moscow",
    weekday: "long",
    year: "numeric",
  }).formatToParts(date);
  const time = new Intl.DateTimeFormat("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Moscow",
  }).format(date);

  return {
    day: displayParts.find((part) => part.type === "day")?.value ?? "",
    dayNumber: Number(dateParts.find((part) => part.type === "day")?.value),
    month: displayParts.find((part) => part.type === "month")?.value ?? "",
    monthIndex:
      Number(dateParts.find((part) => part.type === "month")?.value) - 1,
    weekday:
      displayParts.find((part) => part.type === "weekday")?.value ?? "",
    year: displayParts.find((part) => part.type === "year")?.value ?? "",
    yearNumber: Number(dateParts.find((part) => part.type === "year")?.value),
    time,
  };
}

function parsePreferredTime(value: string | null) {
  if (!value) {
    return null;
  }

  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);

  if (!match) {
    return null;
  }

  return {
    day: Number(match[3]),
    monthIndex: Number(match[2]) - 1,
    time: `${match[4]}:${match[5]}`,
    year: Number(match[1]),
  };
}

function getCalendarDays(year: number, monthIndex: number) {
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const firstDay = new Date(year, monthIndex, 1).getDay();
  const mondayBasedOffset = (firstDay + 6) % 7;

  return [
    ...Array.from({ length: mondayBasedOffset }, () => null),
    ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
  ];
}

const weekDays = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

export function ApplicationLookup() {
  const [applicationCode, setApplicationCode] = useState("");
  const [result, setResult] = useState<LookupResult | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [moscowDateTime, setMoscowDateTime] = useState<ReturnType<
    typeof formatMoscowDateTime
  > | null>(null);
  const [displayMonth, setDisplayMonth] = useState(() => {
    const now = new Date();
    return {
      year: now.getFullYear(),
      monthIndex: now.getMonth(),
    };
  });
  const [activeDay, setActiveDay] = useState<number | null>(null);

  useEffect(() => {
    const updateMoscowDateTime = () => {
      setMoscowDateTime(formatMoscowDateTime(new Date()));
    };

    updateMoscowDateTime();
    const intervalId = window.setInterval(updateMoscowDateTime, 30_000);

    return () => window.clearInterval(intervalId);
  }, []);

  const appointment = parsePreferredTime(result?.preferredTime ?? null);

  useEffect(() => {
    if (appointment) {
      setDisplayMonth({
        year: appointment.year,
        monthIndex: appointment.monthIndex,
      });
      setActiveDay(appointment.day);
      return;
    }

    if (moscowDateTime) {
      setDisplayMonth({
        year: moscowDateTime.yearNumber,
        monthIndex: moscowDateTime.monthIndex,
      });
      setActiveDay(moscowDateTime.dayNumber);
    }
  }, [appointment, moscowDateTime]);

  const calendarMonthName = useMemo(
    () =>
      new Intl.DateTimeFormat("ru-RU", {
        month: "long",
        year: "numeric",
      }).format(new Date(displayMonth.year, displayMonth.monthIndex, 1)),
    [displayMonth]
  );
  const calendarDays = useMemo(
    () => getCalendarDays(displayMonth.year, displayMonth.monthIndex),
    [displayMonth]
  );

  const handleMonthShift = (delta: number) => {
    const nextDate = new Date(displayMonth.year, displayMonth.monthIndex + delta, 1);
    setDisplayMonth({
      year: nextDate.getFullYear(),
      monthIndex: nextDate.getMonth(),
    });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch("/api/applications/lookup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          applicationCode,
        }),
      });
      const data = await response.json();

      if (!response.ok || !data.ok) {
        throw new Error(data.message || "Не удалось найти заявку");
      }

      setResult({
        applicationNumber: data.applicationNumber,
        contactHref: data.contactHref,
        contactMethod: data.contactMethod,
        preferredTime: data.preferredTime,
      });
    } catch (lookupError) {
      setError(
        lookupError instanceof Error
          ? lookupError.message
          : "Не удалось найти заявку"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="bg-cream py-16 select-none">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-start gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="pt-2">
            <h2 className="text-2xl font-bold text-forest sm:text-3xl">
              Проверить дату записи
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-forest/55">
              Введите код под календарем. После проверки здесь отобразится дата
              консультации.
            </p>
          </div>

          <div className="max-w-[560px] rounded-2xl border border-white/50 bg-white/35 p-3 shadow-lg backdrop-blur-md lg:justify-self-end">
            <div className="rounded-xl border border-sage-light/35 bg-sage-light/20 p-3 backdrop-blur-md">
              <div className="flex items-start justify-between gap-3 border-b border-white/50 pb-3 text-forest">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sage text-white">
                    <CalendarDays className="h-4 w-4" />
                  </div>
                  <div className="min-w-[132px]">
                    <p className="text-center text-sm font-semibold">
                      {moscowDateTime
                        ? `${moscowDateTime.day} ${moscowDateTime.month} ${moscowDateTime.year}`
                        : "Текущая дата"}
                    </p>
                    <p className="mt-1 text-center text-xs capitalize text-forest/45">
                      {moscowDateTime?.weekday || "день недели"}
                    </p>
                  </div>
                </div>
                <p className="text-xl font-bold text-sage-dark">
                  {moscowDateTime?.time || "--:--"} МСК
                </p>
              </div>

              <div className="pt-3">
                {appointment ? (
                  <div className="mb-2 flex items-center justify-between rounded-lg border border-sage-light/35 bg-sage-light/20 px-3 py-2 backdrop-blur-sm">
                    <p className="text-sm font-semibold capitalize text-forest">
                      {calendarMonthName}
                    </p>
                    <p className="text-xs font-medium text-sage-dark">
                      Запись: {appointment.day} число, {appointment.time} МСК
                    </p>
                  </div>
                ) : null}

                <div className="rounded-xl border border-sage-light/35 bg-sage-light/15 p-2.5 shadow-inner backdrop-blur-md">
                  <div className="mb-3 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => handleMonthShift(-1)}
                      className="flex h-9 w-9 items-center justify-center rounded-xl border border-sage-light/35 bg-white/70 text-forest transition hover:bg-sage-light/20"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <p className="text-sm font-semibold capitalize text-forest">
                      {calendarMonthName}
                    </p>
                    <button
                      type="button"
                      onClick={() => handleMonthShift(1)}
                      className="flex h-9 w-9 items-center justify-center rounded-xl border border-sage-light/35 bg-white/70 text-forest transition hover:bg-sage-light/20"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-7 gap-1.5 text-center">
                    {weekDays.map((day) => (
                      <div
                        key={day}
                        className="flex items-center justify-center py-1 text-[11px] font-semibold uppercase text-forest/45"
                      >
                        {day}
                      </div>
                    ))}
                    {calendarDays.map((day, index) => {
                      const isCurrentDay =
                        day !== null &&
                        moscowDateTime &&
                        day === moscowDateTime.dayNumber &&
                        displayMonth.monthIndex === moscowDateTime.monthIndex &&
                        displayMonth.year === moscowDateTime.yearNumber;
                      const isAppointmentDay =
                        day !== null &&
                        appointment &&
                        day === appointment.day &&
                        displayMonth.monthIndex === appointment.monthIndex &&
                        displayMonth.year === appointment.year;
                      const isActiveDay = day !== null && day === activeDay;

                      return day === null ? (
                        <div key={`blank-${index}`} className="aspect-square" />
                      ) : (
                        <button
                          key={`${day}-${index}`}
                          type="button"
                          onClick={() => setActiveDay(day)}
                          className={[
                            "flex aspect-square min-h-8 items-center justify-center rounded-md border text-xs font-semibold transition sm:min-h-9 sm:text-sm",
                            "border-sage-light/35 bg-sage-light/10 text-forest backdrop-blur-sm hover:bg-sage-light/20",
                            isCurrentDay
                              ? "border-sage-dark bg-sage-dark text-white shadow-lg ring-2 ring-sage-light/90"
                              : "",
                            isAppointmentDay
                              ? "border-forest bg-forest text-white shadow-md ring-2 ring-sage-light/80"
                              : "",
                            isActiveDay && !isCurrentDay && !isAppointmentDay
                              ? "border-sage bg-white ring-2 ring-sage-light/80"
                              : "",
                          ].join(" ")}
                        >
                          {day}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            <form
              onSubmit={handleSubmit}
              className="mt-3 grid gap-2.5 sm:grid-cols-[1fr_auto]"
            >
              <Input
                aria-label="Код заявки"
                placeholder="LAD-NG6GDW-K05"
                value={applicationCode}
                onChange={(event) => setApplicationCode(event.target.value)}
                className="h-11 rounded-xl border-white/60 bg-white/70 select-text placeholder:text-forest/28"
                required
              />
              <Button
                type="submit"
                disabled={isLoading}
                className="h-11 rounded-xl bg-sage px-4 text-white hover:bg-sage-dark"
              >
                {isLoading ? (
                  <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Search className="mr-2 h-4 w-4" />
                )}
                Найти
              </Button>

              {error ? (
                <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 sm:col-span-2">
                  {error}
                </p>
              ) : null}

              {result ? (
                <div className="rounded-xl border border-white/50 bg-white/55 px-4 py-3 text-sm text-forest backdrop-blur-sm sm:col-span-2">
                  <p className="font-semibold">
                    {result.applicationNumber}:{" "}
                    {appointment
                      ? `${appointment.day} ${calendarMonthName}, ${appointment.time} МСК`
                      : "дата еще уточняется"}
                  </p>
                  <a
                    href={result.contactHref}
                    target={
                      result.contactHref.startsWith("#") ? undefined : "_blank"
                    }
                    rel="noreferrer"
                    className="mt-1 inline-flex text-sage-dark underline-offset-4 hover:underline"
                  >
                    Перейти в {result.contactMethod}
                  </a>
                </div>
              ) : null}
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
