import {
  formatDateKey,
  getMinimumBookingDate,
} from "@/lib/booking-availability";

export { formatDateKey, getMinimumBookingDate };

export const genderOptions = [
  { value: "male", label: "Мужской" },
  { value: "female", label: "Женский" },
] as const;

export function formatBookingDate(date?: Date) {
  if (!date) {
    return "";
  }

  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

export function parsePreferredTimeValue(value: string) {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/);

  if (!match) {
    return {
      date: undefined as Date | undefined,
      time: "",
    };
  }

  return {
    date: new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3])),
    time: `${match[4]}:${match[5]}`,
  };
}

export function buildPreferredTimeValue(date?: Date, time?: string) {
  if (!date || !time) {
    return "";
  }

  return `${formatDateKey(date)}T${time}`;
}
