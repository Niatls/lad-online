export function normalizeOptionalValue(value?: string | null) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

export function formatSourceLabel(value?: string | null) {
  switch (value?.trim().toLowerCase()) {
    case "website":
      return "\u0421\u0430\u0439\u0442";
    case "telegram":
      return "Telegram";
    case "vk":
      return "VK";
    case "discord":
      return "Discord";
    default:
      return value || "\u041d\u0435 \u0443\u043a\u0430\u0437\u0430\u043d";
  }
}
