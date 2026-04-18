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

export function getApplicationContactMethod(value?: string | null) {
  return (
    applicationContactMethods.find((method) => method.value === value) ??
    applicationContactMethods[0]
  );
}
