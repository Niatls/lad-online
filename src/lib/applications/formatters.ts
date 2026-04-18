export function formatApplicationDate(date: Date) {
  return new Intl.DateTimeFormat("ru-RU", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Europe/Moscow",
  }).format(date);
}

export function formatPreferredTime(value?: string | null) {
  if (!value) {
    return "Время не указано";
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("ru-RU", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Europe/Moscow",
  }).format(parsed);
}

export function formatApplicationGender(value?: string | null) {
  switch (value?.trim().toLowerCase()) {
    case "male":
      return "Мужской";
    case "female":
      return "Женский";
    default:
      return "Пол не указан";
  }
}
