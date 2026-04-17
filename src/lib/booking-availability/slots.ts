import {
  BOOKING_CLOSE_MINUTES,
  BOOKING_GAP_MINUTES,
  BOOKING_STEP_MINUTES,
} from "./constants";
import { getEarliestBookingMinute } from "./moscow-time";
import { minutesToTimeString, parsePreferredTime } from "./preferred-time";

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
