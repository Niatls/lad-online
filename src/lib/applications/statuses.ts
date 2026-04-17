export const applicationStatuses = {
  new: "РќРѕРІР°СЏ",
  in_progress: "Р’ СЂР°Р±РѕС‚Рµ",
  completed: "Р—Р°РІРµСЂС€РµРЅР°",
  archived: "Р’ Р°СЂС…РёРІРµ",
} as const;

export type ApplicationStatus = keyof typeof applicationStatuses;

export function getApplicationStatusLabel(status: string) {
  return (
    applicationStatuses[status as keyof typeof applicationStatuses] ?? status
  );
}
