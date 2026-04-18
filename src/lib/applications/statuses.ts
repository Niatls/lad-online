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
