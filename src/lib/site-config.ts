import {
  DiscordIcon,
  TelegramIcon,
  VKIcon,
} from "@/components/home/messenger-icons";

export const siteConfig = {
  brandName: "Лад",
  phone: "+7 (978) 293-95-29",
  phoneHref: "tel:+79782939529",
  email: "lad.psychologicalconsultations@mail.ru",
  emailHref: "mailto:lad.psychologicalconsultations@mail.ru",
  formatLabel: "Онлайн-консультации",
  description:
    "Профессиональные психологические консультации онлайн. Ваше ментальное здоровье — наш приоритет.",
  dataProtectionLabel: "Защита персональных данных по ФЗ-152",
} as const;

export const siteMessengerLinks = [
  {
    Icon: TelegramIcon,
    label: "Telegram",
    href: "https://t.me/lad_Psychological_Consultation",
    color: "hover:bg-white/30",
  },
  {
    Icon: VKIcon,
    label: "VK",
    href: "https://vk.com/id1029460661",
    color: "hover:bg-white/30",
  },
  {
    Icon: DiscordIcon,
    label: "Discord",
    href: "https://discord.com/channels/@me",
    color: "hover:bg-white/30",
  },
] as const;

export const footerServices = [
  "Стресс и тревога",
  "Депрессия",
  "Семейное консультирование",
  "ПТСР",
  "Детская психология",
] as const;
