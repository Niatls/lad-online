import { z } from "zod";

import {
  applicationContactMethods,
  type ApplicationContactMethod,
} from "./contact-methods";

const contactMethodValues = applicationContactMethods.map(
  (method) => method.value
) as [ApplicationContactMethod, ...ApplicationContactMethod[]];

export const applicationFormSchema = z.object({
  name: z.string().trim().min(2, "РЈРєР°Р¶РёС‚Рµ РёРјСЏ РёР»Рё РїСЃРµРІРґРѕРЅРёРј"),
  gender: z.string().trim().min(1, "РЈРєР°Р¶РёС‚Рµ РїРѕР»"),
  age: z.coerce
    .number()
    .int("РЈРєР°Р¶РёС‚Рµ РІРѕР·СЂР°СЃС‚ С‡РёСЃР»РѕРј")
    .min(12, "РЈРєР°Р¶РёС‚Рµ РІРѕР·СЂР°СЃС‚")
    .max(120, "РџСЂРѕРІРµСЂСЊС‚Рµ РІРѕР·СЂР°СЃС‚"),
  preferredTime: z
    .string()
    .trim()
    .min(1, "РЈРєР°Р¶РёС‚Рµ РґР°С‚Сѓ Рё РІСЂРµРјСЏ РєРѕРЅСЃСѓР»СЊС‚Р°С†РёРё"),
  reason: z.string().trim().min(3, "РћРїРёС€РёС‚Рµ РїСЂРѕР±Р»РµРјСѓ, РјРѕР¶РЅРѕ РєСЂР°С‚РєРѕ"),
  contactMethod: z.enum(contactMethodValues, {
    message: "Р’С‹Р±РµСЂРёС‚Рµ СЃРїРѕСЃРѕР± СЃРІСЏР·Рё",
  }),
  phone: z.string().trim().optional().or(z.literal("")),
  email: z.email("РЈРєР°Р¶РёС‚Рµ РєРѕСЂСЂРµРєС‚РЅС‹Р№ email").optional().or(z.literal("")),
});

export type ApplicationFormInput = z.infer<typeof applicationFormSchema>;

export const applicationLookupSchema = z.object({
  applicationCode: z.string().trim().min(1, "РЈРєР°Р¶РёС‚Рµ РєРѕРґ Р·Р°СЏРІРєРё"),
});
