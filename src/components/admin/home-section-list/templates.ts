import { Plus, Quote, Sparkles, type LucideIcon } from "lucide-react";

import type { HomeSectionVariant } from "@/lib/home-sections";

export type CustomHomeSectionTemplate = {
  label: string;
  variant: HomeSectionVariant;
  icon: LucideIcon;
};

export const customHomeSectionTemplates: CustomHomeSectionTemplate[] = [
  { label: "\u0418\u043d\u0444\u043e-\u0431\u043b\u043e\u043a", variant: "default", icon: Plus },
  {
    label: "\u0410\u043a\u0446\u0435\u043d\u0442\u043d\u044b\u0439 \u0431\u043b\u043e\u043a",
    variant: "highlight",
    icon: Sparkles,
  },
  { label: "\u0426\u0438\u0442\u0430\u0442\u0430", variant: "quote", icon: Quote },
];
