"use client";

import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";

import { weekDays } from "./calendar-utils";

type LookupCalendarProps = {
  activeDay: number | null;
  appointment: {
    day: number;
    monthIndex: number;
    time: string;
    year: number;
  } | null;
  calendarDays: Array<number | null>;
  calendarMonthName: string;
  displayMonth: {
    monthIndex: number;
    year: number;
  };
  moscowDateTime: {
    day: string;
    dayNumber: number;
    month: string;
    monthIndex: number;
    time: string;
    weekday: string;
    year: string;
    yearNumber: number;
  } | null;
  onMonthShift: (delta: number) => void;
  onSelectDay: (day: number) => void;
};

export function LookupCalendar({
  activeDay,
  appointment,
  calendarDays,
  calendarMonthName,
  displayMonth,
  moscowDateTime,
  onMonthShift,
  onSelectDay,
}: LookupCalendarProps) {
  return (
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
              onClick={() => onMonthShift(-1)}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-sage-light/35 bg-white/70 text-forest transition hover:bg-sage-light/20"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <p className="text-sm font-semibold capitalize text-forest">
              {calendarMonthName}
            </p>
            <button
              type="button"
              onClick={() => onMonthShift(1)}
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
                  onClick={() => onSelectDay(day)}
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
  );
}
