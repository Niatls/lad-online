"use client";

import { useEffect, useMemo, useState } from "react";

import { buildAvailableBookingTimes } from "@/lib/booking-availability";

import {
  buildPreferredTimeValue,
  formatDateKey,
  parsePreferredTimeValue,
} from "../booking-utils";

export function useBookingTimeSelection(
  preferredTime: string,
  onPreferredTimeChange: (value: string) => void
) {
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
    onPreferredTimeChange(buildPreferredTimeValue(date, time));
  };

  useEffect(() => {
    if (!selectedDate) {
      setSelectedHour("");
      return;
    }

    if (!selectedTime) {
      if (
        selectedHour &&
        !availableTimes.some((time) => time.startsWith(`${selectedHour}:`))
      ) {
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

  return {
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
  };
}
