import { z } from "zod";

export const applicationFormSchema = z.object({
  name: z.string().trim().min(2, "Укажите имя"),
  email: z.email("Укажите корректный email"),
  phone: z.string().trim().min(6, "Укажите телефон"),
  reason: z.string().trim().min(5, "Опишите причину обращения"),
});

export type ApplicationFormInput = z.infer<typeof applicationFormSchema>;

export const applicationStatuses = {
  new: "Новая",
  in_progress: "В работе",
  completed: "Завершена",
  archived: "В архиве",
} as const;

export type ApplicationStatus = keyof typeof applicationStatuses;

export function formatApplicationNumber(id: number) {
  return `LAD-${id.toString().padStart(6, "0")}`;
}

export function formatApplicationDate(date: Date) {
  return new Intl.DateTimeFormat("ru-RU", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}
