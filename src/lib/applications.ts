import { z } from "zod";

export const applicationContactMethods = [
  {
    value: "site_chat",
    label: "Чат сайта",
    href: "#chat",
  },
  {
    value: "vk",
    label: "VK",
    href: "https://vk.com/id1029460661",
  },
  {
    value: "telegram",
    label: "Telegram",
    href: "https://t.me/lad_Psychological_Consultation",
  },
  {
    value: "max",
    label: "MAX",
    href: "https://max.ru/u/f9LHodD0cOK7BpuCIK6wac9LWAa7ryMCfhwkxjqFL6cKiIO2oKrpYQ9qiJw",
  },
  {
    value: "discord",
    label: "Discord",
    href: "https://discord.com/invite/b2DzPrTMsz",
  },
  {
    value: "whatsapp",
    label: "WhatsApp",
    href: "https://wa.me/79782939529",
  },
] as const;

export type ApplicationContactMethod =
  (typeof applicationContactMethods)[number]["value"];

const contactMethodValues = applicationContactMethods.map(
  (method) => method.value
) as [ApplicationContactMethod, ...ApplicationContactMethod[]];

export const applicationFormSchema = z.object({
  name: z.string().trim().min(2, "Укажите имя или псевдоним"),
  gender: z.string().trim().min(1, "Укажите пол"),
  age: z.coerce
    .number()
    .int("Укажите возраст числом")
    .min(12, "Укажите возраст")
    .max(120, "Проверьте возраст"),
  preferredTime: z
    .string()
    .trim()
    .min(1, "Укажите дату и время консультации"),
  reason: z.string().trim().min(3, "Опишите проблему, можно кратко"),
  contactMethod: z.enum(contactMethodValues, {
    message: "Выберите способ связи",
  }),
  phone: z.string().trim().optional().or(z.literal("")),
  email: z.email("Укажите корректный email").optional().or(z.literal("")),
});

export type ApplicationFormInput = z.infer<typeof applicationFormSchema>;

export const applicationLookupSchema = z.object({
  applicationCode: z.string().trim().min(1, "Укажите код заявки"),
});

export const applicationStatuses = {
  new: "Новая",
  in_progress: "В работе",
  completed: "Завершена",
  archived: "В архиве",
} as const;

export type ApplicationStatus = keyof typeof applicationStatuses;

export function getApplicationStatusLabel(status: string) {
  return (
    applicationStatuses[status as keyof typeof applicationStatuses] ?? status
  );
}

export function formatApplicationNumber(
  id: number,
  verificationCode?: string | null
) {
  const normalizedCode = verificationCode?.trim().toUpperCase();

  return normalizedCode ? `LAD-${normalizedCode}-K0${id}` : `LAD-K0${id}`;
}

export function parseApplicationNumber(value: string) {
  const trimmed = value.trim();
  const match =
    trimmed.match(/^LAD[-\s]*[A-Z0-9]+[-\s]*K0*(\d+)$/i) ||
    trimmed.match(/^LAD[-\s]*код[-\s]*K0*(\d+)$/i) ||
    trimmed.match(/^LAD[-\s]*0*(\d+)$/i) ||
    trimmed.match(/^0*(\d+)$/);

  return match ? Number(match[1]) : Number.NaN;
}

export function parseApplicationCode(value: string) {
  const trimmed = value.trim();
  const match = trimmed.match(/^LAD[-\s]*([A-Z0-9]+)[-\s]*K0*(\d+)$/i);

  if (!match) {
    return {
      id: parseApplicationNumber(trimmed),
      verificationCode: null,
    };
  }

  return {
    id: Number(match[2]),
    verificationCode: match[1].toUpperCase(),
  };
}

export function getApplicationContactMethod(value?: string | null) {
  return (
    applicationContactMethods.find((method) => method.value === value) ??
    applicationContactMethods[0]
  );
}

export function generateApplicationVerificationCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = crypto.getRandomValues(new Uint8Array(6));

  return Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join("");
}

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
