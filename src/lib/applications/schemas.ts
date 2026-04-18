import { z } from "zod";

import {
  applicationContactMethods,
  type ApplicationContactMethod,
} from "./contact-methods";

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
  email: z
    .email("Укажите корректный email")
    .optional()
    .or(z.literal("")),
});

export type ApplicationFormInput = z.infer<typeof applicationFormSchema>;

export const applicationLookupSchema = z.object({
  applicationCode: z.string().trim().min(1, "Укажите код заявки"),
});
