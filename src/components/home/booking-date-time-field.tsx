"use client";

import { useEffect, useMemo, useState } from "react";

import { ru } from "date-fns/locale";
import { CalendarDays, Clock3 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { buildAvailableBookingTimes } from "@/lib/booking-availability";
import { cn } from "@/lib/utils";

import type {
  BookingFieldChangeHandler,
  BookingFormData,
} from "./booking-types";
import {
  buildPreferredTimeValue,
  formatBookingDate,
  formatDateKey,
  getMinimumBookingDate,
  parsePreferredTimeValue,
} from "./booking-utils";

type BookingDateTimeFieldProps = {
  preferredTime: BookingFormData["preferredTime"];
  onFieldChange: BookingFieldChangeHandler;
};

export function BookingDateTimeField({
  preferredTime,
  onFieldChange,
}: BookingDateTimeFieldProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedHour, setSelectedHour] = useState("");
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [timeOpen, setTimeOpen] = useState(false);
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [isLoadingAvailability, setIsLoadingAvailability] = useState(false);

  useEffect(() => {
    const parsedValue = parsePreferredTimeValue(preferredTime);
    setSelectedDate(parsedValue.date);
    setSelectedTime(parsedValue.time);
    setSelectedHour(parsedValue.time ? parsedValue.time.split(":")[0] : "");
  }, [preferredTime]);

  useEffect(() => {
    const dateKey = selectedDate ? formatDateKey(selectedDate) : "";

    if (!dateKey) {
      setAvailableTimes([]);
      return;
    }

    let isActive = true;
    const fallbackTimes = buildAvailableBookingTimes(dateKey, []);

    setIsLoadingAvailability(true);
    setAvailableTimes(fallbackTimes);

    fetch(`/api/applications/availability?date=${dateKey}`, {
      cache: "no-store",
    })
      .then(async (response) => {
        const result = await response.json();

        if (!response.ok || !result.ok) {
          throw new Error(result.message || "Failed to load booking slots.");
        }

        if (isActive) {
          setAvailableTimes(
            Array.isArray(result.availableTimes) ? result.availableTimes : []
          );
        }
      })
      .catch(() => {
        if (isActive) {
          setAvailableTimes(fallbackTimes);
        }
      })
      .finally(() => {
        if (isActive) {
          setIsLoadingAvailability(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, [selectedDate]);

  const syncPreferredTime = (date?: Date, time?: string) => {
    setSelectedDate(date);
    setSelectedTime(time ?? "");
    onFieldChange("preferredTime", buildPreferredTimeValue(date, time));
  };

  useEffect(() => {
    if (!selectedDate) {
      setSelectedHour("");
      return;
    }

    if (!selectedTime) {
      if (selectedHour && !availableTimes.some((time) => time.startsWith(`${selectedHour}:`))) {
        setSelectedHour("");
      }
      return;
    }

    if (!availableTimes.includes(selectedTime)) {
      setSelectedHour("");
      syncPreferredTime(selectedDate, "");
      return;
    }

    const timeHour = selectedTime.split(":")[0];
    if (selectedHour !== timeHour) {
      setSelectedHour(timeHour);
    }
  }, [availableTimes, selectedDate, selectedHour, selectedTime]);

  const availableHours = useMemo(
    () => Array.from(new Set(availableTimes.map((time) => time.split(":")[0]))),
    [availableTimes]
  );
  const availableMinutes = selectedHour
    ? availableTimes
        .filter((time) => time.startsWith(`${selectedHour}:`))
        .map((time) => time.split(":")[1])
    : [];
  const selectedMinute =
    selectedTime && selectedTime.startsWith(`${selectedHour}:`)
      ? selectedTime.split(":")[1]
      : "";

  return (
    <div className="space-y-2 select-none">
      <label className="text-sm font-medium text-forest">
        Дата и время консультации
      </label>
      <div className="grid gap-3 sm:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
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
            className="w-[var(--radix-popover-trigger-width)] max-w-[var(--radix-popover-trigger-width)] rounded-2xl border-sage-light/30 bg-cream p-2 shadow-xl select-none"
          >
            <Calendar
              locale={ru}
              showOutsideDays={false}
              formatters={{
                formatCaption: (date) =>
                  new Intl.DateTimeFormat("ru-RU", {
                    month: "long",
                    year: "numeric",
                  }).format(date),
                formatWeekdayName: (date) =>
                  new Intl.DateTimeFormat("ru-RU", {
                    weekday: "short",
                  })
                    .format(date)
                    .slice(0, 2),
              }}
              mode="single"
              selected={selectedDate}
              onSelect={(date) => {
                syncPreferredTime(date, "");
                setSelectedHour("");
                if (date) {
                  setCalendarOpen(false);
                }
              }}
              disabled={(date) => date < getMinimumBookingDate()}
              className="w-full rounded-xl bg-transparent"
              classNames={{
                months: "w-full",
                month: "w-full",
                month_caption:
                  "flex h-8 w-full items-center justify-center px-8 text-sm font-semibold capitalize text-forest",
                caption_label: "text-sm font-semibold capitalize text-forest",
                weekdays: "grid grid-cols-7 gap-1.5",
                weekday:
                  "flex items-center justify-center rounded-md text-[0.75rem] font-medium uppercase text-forest/45",
                week: "mt-2 grid grid-cols-7 gap-1.5",
                day: "relative aspect-square h-full w-full p-0 text-center select-none",
                outside: "hidden",
                today: "rounded-md bg-sage-light/30 text-forest",
                button_previous:
                  "flex size-8 items-center justify-center rounded-xl border border-sage-light/40 bg-white text-forest transition hover:bg-sage-light/10 disabled:cursor-not-allowed disabled:opacity-40",
                button_next:
                  "flex size-8 items-center justify-center rounded-xl border border-sage-light/40 bg-white text-forest transition hover:bg-sage-light/10 disabled:cursor-not-allowed disabled:opacity-40",
              }}
            />
          </PopoverContent>
        </Popover>

        <Popover open={timeOpen} onOpenChange={setTimeOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              disabled={!selectedDate}
              className="h-12 w-full justify-start rounded-xl border-sage-light/30 bg-white px-4 font-normal text-forest shadow-sm transition hover:bg-sage-light/10 disabled:cursor-not-allowed disabled:opacity-70"
            >
              <Clock3 className="mr-2 h-4 w-4 text-sage-dark" />
              {selectedTime ? (
                <span>{selectedTime}</span>
              ) : (
                <span className="text-forest/35">Выберите время</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent
            align="end"
            className="w-[var(--radix-popover-trigger-width)] max-w-[var(--radix-popover-trigger-width)] rounded-2xl border-sage-light/30 bg-cream p-3 shadow-xl select-none"
          >
            <div className="mb-3 flex items-center justify-between px-1">
              <span className="text-xs font-semibold uppercase tracking-[0.22em] text-forest/40">
                Время
              </span>
              <span className="text-sm font-semibold text-sage-dark">
                {isLoadingAvailability
                  ? "..."
                  : selectedTime || (availableTimes[0] ?? "--:--")}
              </span>
            </div>

            {selectedDate && !isLoadingAvailability && availableTimes.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-sage-light/30 bg-white/70 px-4 py-6 text-center text-sm text-forest/55">
                На выбранную дату свободных слотов нет. Попробуйте другой день.
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <TimeColumn
                  label="Часы"
                  options={availableHours}
                  selectedValue={selectedHour}
                  onSelect={(hour) => {
                    setSelectedHour(hour);

                    if (selectedTime && !selectedTime.startsWith(`${hour}:`)) {
                      syncPreferredTime(selectedDate, "");
                    }
                  }}
                />
                <TimeColumn
                  label="Минуты"
                  options={availableMinutes}
                  selectedValue={selectedMinute}
                  disabled={!selectedHour}
                  emptyLabel="Сначала выберите час"
                  onSelect={(minute) => {
                    if (!selectedDate || !selectedHour) {
                      return;
                    }

                    syncPreferredTime(selectedDate, `${selectedHour}:${minute}`);
                    setTimeOpen(false);
                  }}
                />
              </div>
            )}
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}

type TimeColumnProps = {
  label: string;
  options: readonly string[];
  selectedValue: string;
  onSelect: (value: string) => void;
  disabled?: boolean;
  emptyLabel?: string;
};

function TimeColumn({
  label,
  options,
  selectedValue,
  onSelect,
  disabled = false,
  emptyLabel = "Нет доступных значений",
}: TimeColumnProps) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-sage-light/30 bg-white/80 select-none",
        disabled && "opacity-55"
      )}
    >
      <div className="border-b border-sage-light/20 px-3 py-2 text-center text-xs font-semibold uppercase tracking-[0.2em] text-forest/40">
        {label}
      </div>
      <ScrollArea className="h-48">
        {options.length === 0 ? (
          <div className="flex h-48 items-center justify-center px-4 text-center text-sm text-forest/45">
            {emptyLabel}
          </div>
        ) : (
          <div className="space-y-1 p-2">
            {options.map((option) => (
              <button
                key={option}
                type="button"
                disabled={disabled}
                onClick={() => onSelect(option)}
                className={cn(
                  "flex h-10 w-full items-center justify-center rounded-xl text-sm font-semibold transition",
                  selectedValue === option
                    ? "bg-sage text-white shadow-sm"
                    : "text-forest hover:bg-sage-light/15",
                  disabled && "pointer-events-none"
                )}
              >
                {option}
              </button>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
