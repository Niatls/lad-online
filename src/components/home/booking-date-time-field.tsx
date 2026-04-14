"use client";

import { useEffect, useState } from "react";

import { CalendarDays, Clock3 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [timeOpen, setTimeOpen] = useState(false);
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [isLoadingAvailability, setIsLoadingAvailability] = useState(false);

  useEffect(() => {
    const parsedValue = parsePreferredTimeValue(preferredTime);
    setSelectedDate(parsedValue.date);
    setSelectedTime(parsedValue.time);
  }, [preferredTime]);

  useEffect(() => {
    const dateKey = selectedDate ? formatDateKey(selectedDate) : "";

    if (!dateKey) {
      setAvailableTimes([]);
      return;
    }

    let isActive = true;

    setIsLoadingAvailability(true);

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
          setAvailableTimes([]);
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
    if (!selectedDate || !selectedTime) {
      return;
    }

    if (!availableTimes.includes(selectedTime)) {
      syncPreferredTime(selectedDate, "");
    }
  }, [availableTimes, selectedDate, selectedTime]);

  const selectedHour = selectedTime ? selectedTime.split(":")[0] : "";
  const selectedMinute = selectedTime ? selectedTime.split(":")[1] : "";
  const availableHours = Array.from(
    new Set(availableTimes.map((time) => time.split(":")[0]))
  );
  const activeHour =
    selectedHour && availableHours.includes(selectedHour)
      ? selectedHour
      : availableHours[0] || "";
  const activeMinutes = activeHour
    ? availableTimes
        .filter((time) => time.startsWith(`${activeHour}:`))
        .map((time) => time.split(":")[1])
    : [];
  const selectedTimeLabel =
    selectedHour && selectedMinute ? `${selectedHour}:${selectedMinute}` : "";

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-forest">
        Р”Р°С‚Р° Рё РІСЂРµРјСЏ РєРѕРЅСЃСѓР»СЊС‚Р°С†РёРё
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
                : "Р’С‹Р±РµСЂРёС‚Рµ РґР°С‚Сѓ РєРѕРЅСЃСѓР»СЊС‚Р°С†РёРё"}
            </Button>
          </PopoverTrigger>
          <PopoverContent
            align="start"
            className="w-[var(--radix-popover-trigger-width)] max-w-[var(--radix-popover-trigger-width)] rounded-2xl border-sage-light/30 bg-cream p-2 shadow-xl"
          >
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => {
                syncPreferredTime(date, "");
                if (date) {
                  setCalendarOpen(false);
                }
              }}
              disabled={(date) => date < getMinimumBookingDate()}
              className="w-full rounded-xl bg-transparent"
              classNames={{
                months: "w-full",
                month: "w-full",
                table: "w-full border-collapse",
                head_row: "grid grid-cols-7",
                row: "mt-2 grid grid-cols-7",
                cell: "p-0 text-center",
                month_caption:
                  "flex h-8 w-full items-center justify-center px-8 text-sm font-semibold text-forest",
                weekday: "rounded-md text-[0.75rem] font-medium text-forest/45",
                day: "relative aspect-square h-full w-full p-0 text-center select-none",
                today: "rounded-md bg-sage-light/30 text-forest",
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
              {selectedTimeLabel ? (
                <span>{selectedTimeLabel}</span>
              ) : (
                <span className="text-forest/45">Р’СЂРµРјСЏ</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent
            align="end"
            className="w-[var(--radix-popover-trigger-width)] max-w-[var(--radix-popover-trigger-width)] rounded-2xl border-sage-light/30 bg-cream p-3 shadow-xl"
          >
            <div className="mb-3 flex items-center justify-between px-1">
              <span className="text-xs font-semibold uppercase tracking-[0.22em] text-forest/40">
                Р’СЂРµРјСЏ
              </span>
              <span className="text-sm font-semibold text-sage-dark">
                {isLoadingAvailability
                  ? "..."
                  : selectedTimeLabel || availableTimes[0] || "--:--"}
              </span>
            </div>

            {selectedDate && !isLoadingAvailability && availableTimes.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-sage-light/30 bg-white/70 px-4 py-6 text-center text-sm text-forest/55">
                На выбранную дату свободных слотов нет. Попробуйте другой день.
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <TimeColumn
                  label="Р§Р°СЃС‹"
                  options={availableHours}
                  selectedValue={activeHour}
                  onSelect={(hour) => {
                    if (!selectedDate) {
                      return;
                    }

                    const nextMinute =
                      availableTimes
                        .find((time) => time.startsWith(`${hour}:`))
                        ?.split(":")[1] || "00";

                    syncPreferredTime(selectedDate, `${hour}:${nextMinute}`);
                  }}
                />
                <TimeColumn
                  label="РњРёРЅСѓС‚С‹"
                  options={activeMinutes}
                  selectedValue={
                    activeHour === selectedHour ? selectedMinute : ""
                  }
                  onSelect={(minute) => {
                    if (!selectedDate || !activeHour) {
                      return;
                    }

                    syncPreferredTime(selectedDate, `${activeHour}:${minute}`);
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
};

function TimeColumn({
  label,
  options,
  selectedValue,
  onSelect,
}: TimeColumnProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-sage-light/30 bg-white/80">
      <div className="border-b border-sage-light/20 px-3 py-2 text-center text-xs font-semibold uppercase tracking-[0.2em] text-forest/40">
        {label}
      </div>
      <ScrollArea className="h-48">
        {options.length === 0 ? (
          <div className="flex h-48 items-center justify-center px-4 text-center text-sm text-forest/45">
            Нет доступных значений
          </div>
        ) : (
          <div className="space-y-1 p-2">
            {options.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => onSelect(option)}
                className={cn(
                  "flex h-10 w-full items-center justify-center rounded-xl text-sm font-semibold transition",
                  selectedValue === option
                    ? "bg-sage text-white shadow-sm"
                    : "text-forest hover:bg-sage-light/15"
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
