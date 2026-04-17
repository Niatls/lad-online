import {
  BOOKING_LEAD_TIME_MINUTES,
  BOOKING_OPEN_MINUTES,
  BOOKING_STEP_MINUTES,
  MOSCOW_TIME_ZONE,
} from "./constants";

type MoscowDateParts = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
};

function getMoscowFormatter() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: MOSCOW_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function getMoscowDateParts(now = new Date()): MoscowDateParts {
  const parts = getMoscowFormatter().formatToParts(now);
  const lookup = Object.fromEntries(
    parts
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, Number(part.value)])
  ) as Record<"year" | "month" | "day" | "hour" | "minute", number>;

  return {
    year: lookup.year,
    month: lookup.month,
    day: lookup.day,
    hour: lookup.hour,
    minute: lookup.minute,
  };
}

function roundUpToStep(totalMinutes: number, step = BOOKING_STEP_MINUTES) {
  return Math.ceil(totalMinutes / step) * step;
}

export function formatDateKey(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function getMoscowTodayKey(now = new Date()) {
  const parts = getMoscowDateParts(now);
  return `${parts.year}-${`${parts.month}`.padStart(2, "0")}-${`${parts.day}`.padStart(2, "0")}`;
}

export function getMinimumBookingDate(now = new Date()) {
  const parts = getMoscowDateParts(now);
  return new Date(parts.year, parts.month - 1, parts.day);
}

export function getEarliestBookingMinute(dateKey: string, now = new Date()) {
  const todayKey = getMoscowTodayKey(now);

  if (dateKey < todayKey) {
    return Number.POSITIVE_INFINITY;
  }

  if (dateKey > todayKey) {
    return BOOKING_OPEN_MINUTES;
  }

  const parts = getMoscowDateParts(now);
  const currentMinutes = parts.hour * 60 + parts.minute;
  const leadMinutes = roundUpToStep(
    currentMinutes + BOOKING_LEAD_TIME_MINUTES,
    BOOKING_STEP_MINUTES
  );

  return Math.max(BOOKING_OPEN_MINUTES, leadMinutes);
}
