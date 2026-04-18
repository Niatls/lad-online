"use client";

import type React from "react";

import { LookupCalendar } from "./application-lookup/lookup-calendar";
import { LookupForm } from "./application-lookup/lookup-form";
import { useApplicationLookup } from "./application-lookup/use-application-lookup";

export function ApplicationLookup() {
  const {
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
  } = useApplicationLookup();

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    void handleSubmit();
  };

  return (
    <section id="lookup" className="scroll-mt-28 bg-cream py-16 select-none">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-start gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="pt-2">
            <h2 className="text-2xl font-bold text-forest sm:text-3xl">
              Проверить дату записи
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-forest/55">
              Введите код под календарём. После проверки здесь появится дата
              консультации.
            </p>
          </div>

          <div className="max-w-[560px] rounded-2xl border border-white/50 bg-white/35 p-3 shadow-lg backdrop-blur-md lg:justify-self-end">
            <LookupCalendar
              activeDay={activeDay}
              appointment={appointment}
              calendarDays={calendarDays}
              calendarMonthName={calendarMonthName}
              displayMonth={displayMonth}
              moscowDateTime={moscowDateTime}
              onMonthShift={handleMonthShift}
              onSelectDay={setActiveDay}
            />

            <LookupForm
              applicationCode={applicationCode}
              appointment={appointment}
              calendarMonthName={calendarMonthName}
              contactHref={result?.contactHref}
              contactMethod={result?.contactMethod}
              error={error}
              isLoading={isLoading}
              onCodeChange={setApplicationCode}
              onSubmit={onSubmit}
              resultNumber={result?.applicationNumber}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
