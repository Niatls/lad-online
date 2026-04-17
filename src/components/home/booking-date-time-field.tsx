"use client";

import { ru } from "date-fns/locale";
import { CalendarDays, Clock3 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { TimeColumn } from "./booking-date-time/time-column";
import { useBookingTimeSelection } from "./booking-date-time/use-booking-time-selection";
import type {
  BookingFieldChangeHandler,
  BookingFormData,
} from "./booking-types";
import { formatBookingDate, getMinimumBookingDate } from "./booking-utils";

type BookingDateTimeFieldProps = {
  preferredTime: BookingFormData["preferredTime"];
  onFieldChange: BookingFieldChangeHandler;
};

export function BookingDateTimeField({
  preferredTime,
  onFieldChange,
}: BookingDateTimeFieldProps) {
  const {
    availableHours,
    availableMinutes,
    availableTimes,
    calendarOpen,
    isLoadingAvailability,
    selectedDate,
    selectedHour,
    selectedMinute,
    selectedTime,
    setCalendarOpen,
    setSelectedHour,
    setTimeOpen,
    syncPreferredTime,
    timeOpen,
  } = useBookingTimeSelection(preferredTime, (value) =>
    onFieldChange("preferredTime", value)
  );

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
