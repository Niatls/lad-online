import { applicationContactMethods } from "@/lib/applications";
import { formatDateKey, getMinimumBookingDate } from "@/lib/booking-availability";

export function parseGenderInput(value: string) {
  const normalized = value.trim().toLowerCase();

  if (normalized === "мужской" || normalized === "male") {
    return "male";
  }

  if (normalized === "женский" || normalized === "female") {
    return "female";
  }

  return null;
}

export function parseContactMethodInput(value: string) {
  const normalized = value.trim().toLowerCase();

  return (
    applicationContactMethods.find(
      (method) =>
        method.value.toLowerCase() === normalized ||
        method.label.toLowerCase() === normalized
    ) ?? null
  );
}

export function parseBookingDateInput(value: string) {
  const normalized = value.trim().toLowerCase();
  const today = getMinimumBookingDate();

  if (normalized === "сегодня") {
    return formatDateKey(today);
  }

  if (normalized === "завтра") {
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return formatDateKey(tomorrow);
  }

  const isoMatch = normalized.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoMatch) {
    return normalized;
  }

  const ruMatch = normalized.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
  if (!ruMatch) {
    return null;
  }

  return `${ruMatch[3]}-${ruMatch[2]}-${ruMatch[1]}`;
}

export function isAllowedBookingDate(dateKey: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) {
    return false;
  }

  return dateKey >= formatDateKey(getMinimumBookingDate());
}

export function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function buildTimePreview(times: readonly string[]) {
  if (times.length === 0) {
    return "Свободных слотов на эту дату сейчас нет.";
  }

  const preview = times.slice(0, 12).join(", ");
  return times.length > 12 ? `${preview}...` : preview;
}
