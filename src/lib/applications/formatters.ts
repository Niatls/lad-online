export function formatApplicationDate(date: Date) {
  return new Intl.DateTimeFormat("ru-RU", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Europe/Moscow",
  }).format(date);
}

export function formatPreferredTime(value?: string | null) {
  if (!value) {
    return "Р’СЂРµРјСЏ РЅРµ СѓРєР°Р·Р°РЅРѕ";
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
      return "РњСѓР¶СЃРєРѕР№";
    case "female":
      return "Р–РµРЅСЃРєРёР№";
    default:
      return "РџРѕР» РЅРµ СѓРєР°Р·Р°РЅ";
  }
}
