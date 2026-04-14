const MOSCOW_TIME_ZONE = "Europe/Moscow";

export const BOOKING_OPEN_HOUR = 10;
export const BOOKING_CLOSE_HOUR = 22;
export const BOOKING_STEP_MINUTES = 5;
export const BOOKING_LEAD_TIME_MINUTES = 70;
export const BOOKING_GAP_MINUTES = 100;

const BOOKING_OPEN_MINUTES = BOOKING_OPEN_HOUR * 60;
const BOOKING_CLOSE_MINUTES = BOOKING_CLOSE_HOUR * 60;

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

export function parsePreferredTime(preferredTime: string) {
  const match = preferredTime.match(
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/
  );

  if (!match) {
    return null;
  }

  return {
    dateKey: `${match[1]}-${match[2]}-${match[3]}`,
    time: `${match[4]}:${match[5]}`,
    minutes: Number(match[4]) * 60 + Number(match[5]),
  };
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

export function minutesToTimeString(totalMinutes: number) {
  const hour = Math.floor(totalMinutes / 60);
  const minute = totalMinutes % 60;
  return `${`${hour}`.padStart(2, "0")}:${`${minute}`.padStart(2, "0")}`;
}

export function buildAvailableBookingTimes(
  dateKey: string,
  existingPreferredTimes: readonly string[],
  now = new Date()
) {
  const earliestMinute = getEarliestBookingMinute(dateKey, now);

  if (earliestMinute > BOOKING_CLOSE_MINUTES) {
    return [] as string[];
  }

  const bookedMinutes = existingPreferredTimes
    .map((preferredTime) => parsePreferredTime(preferredTime))
    .filter(
      (entry): entry is NonNullable<typeof entry> => entry?.dateKey === dateKey
    )
    .map((entry) => entry.minutes);

  const availableTimes: string[] = [];

  for (
    let minute = earliestMinute;
    minute <= BOOKING_CLOSE_MINUTES;
    minute += BOOKING_STEP_MINUTES
  ) {
    const isAvailable = bookedMinutes.every(
      (bookedMinute) => Math.abs(bookedMinute - minute) >= BOOKING_GAP_MINUTES
    );

    if (isAvailable) {
      availableTimes.push(minutesToTimeString(minute));
    }
  }

  return availableTimes;
}

export function isPreferredTimeAvailable(
  preferredTime: string,
  existingPreferredTimes: readonly string[],
  now = new Date()
) {
  const parsed = parsePreferredTime(preferredTime);

  if (!parsed) {
    return false;
  }

  return buildAvailableBookingTimes(
    parsed.dateKey,
    existingPreferredTimes,
    now
  ).includes(parsed.time);
}
