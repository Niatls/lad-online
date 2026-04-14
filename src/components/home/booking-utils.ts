const MIN_DATE_HOURS = [0, 0, 0, 0] as const;

export const genderOptions = [
  { value: "male", label: "Мужской" },
  { value: "female", label: "Женский" },
] as const;

export const minuteOptions = [
  "00",
  "05",
  "10",
  "15",
  "20",
  "25",
  "30",
  "35",
  "40",
  "45",
  "50",
  "55",
] as const;

export const hourOptions = [
  "09",
  "10",
  "11",
  "12",
  "13",
  "14",
  "15",
  "16",
  "17",
  "18",
  "19",
  "20",
  "21",
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

  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");

  return `${year}-${month}-${day}T${time}`;
}

export function getMinimumBookingDate() {
  const date = new Date();
  date.setHours(...MIN_DATE_HOURS);
  return date;
}
