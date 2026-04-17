"use client";

import { useEffect, useMemo, useState } from "react";

import {
  formatMoscowDateTime,
  getCalendarDays,
  parseLookupPreferredTime,
} from "./calendar-utils";
import type { LookupResult } from "./types";

export function useApplicationLookup() {
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

  const appointment = parseLookupPreferredTime(result?.preferredTime ?? null);

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
    const nextDate = new Date(
      displayMonth.year,
      displayMonth.monthIndex + delta,
      1
    );
    setDisplayMonth({
      year: nextDate.getFullYear(),
      monthIndex: nextDate.getMonth(),
    });
  };

  const handleSubmit = async () => {
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
        lookupError instanceof Error ? lookupError.message : "Не удалось найти заявку"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return {
    activeDay,
    appointment,
    applicationCode,
    calendarDays,
    calendarMonthName,
    displayMonth,
    error,
    handleMonthShift,
    handleSubmit,
    isLoading,
    moscowDateTime,
    result,
    setActiveDay,
    setApplicationCode,
  };
}
