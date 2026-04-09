export function statusBadgeClass(status: string) {
  switch (status) {
    case "completed":
      return "bg-emerald-100 text-emerald-700";
    case "in_progress":
      return "bg-amber-100 text-amber-800";
    case "archived":
      return "bg-stone-200 text-stone-700";
    default:
      return "bg-sky-100 text-sky-800";
  }
}
