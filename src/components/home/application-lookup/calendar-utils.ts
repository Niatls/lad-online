export function formatMoscowDateTime(date: Date) {
  const dateParts = new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    timeZone: "Europe/Moscow",
    year: "numeric",
  }).formatToParts(date);
  const displayParts = new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "long",
    timeZone: "Europe/Moscow",
    weekday: "long",
    year: "numeric",
  }).formatToParts(date);
  const time = new Intl.DateTimeFormat("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Moscow",
  }).format(date);

  return {
    day: displayParts.find((part) => part.type === "day")?.value ?? "",
    dayNumber: Number(dateParts.find((part) => part.type === "day")?.value),
    month: displayParts.find((part) => part.type === "month")?.value ?? "",
    monthIndex:
      Number(dateParts.find((part) => part.type === "month")?.value) - 1,
    weekday:
      displayParts.find((part) => part.type === "weekday")?.value ?? "",
    year: displayParts.find((part) => part.type === "year")?.value ?? "",
    yearNumber: Number(dateParts.find((part) => part.type === "year")?.value),
    time,
  };
}

export function parseLookupPreferredTime(value: string | null) {
  if (!value) {
    return null;
  }

  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);

  if (!match) {
    return null;
  }

  return {
    day: Number(match[3]),
    monthIndex: Number(match[2]) - 1,
    time: `${match[4]}:${match[5]}`,
    year: Number(match[1]),
  };
}

export function getCalendarDays(year: number, monthIndex: number) {
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const firstDay = new Date(year, monthIndex, 1).getDay();
  const mondayBasedOffset = (firstDay + 6) % 7;

  return [
    ...Array.from({ length: mondayBasedOffset }, () => null),
    ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
  ];
}

export const weekDays = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
