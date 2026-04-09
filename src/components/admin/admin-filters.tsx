import { applicationStatuses } from "@/lib/applications";

type AdminFiltersProps = {
  filterStatus?: string;
  applicationsCount: number;
};

export function AdminFilters({
  filterStatus,
  applicationsCount,
}: AdminFiltersProps) {
  return (
    <div className="flex flex-col gap-4 border-b border-sage-light/20 px-6 py-5 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-wrap gap-2">
        <a
          href="/admin"
          className={`rounded-full px-4 py-2 text-sm font-medium transition ${
            !filterStatus
              ? "bg-forest text-white"
              : "bg-sage-light/20 text-forest hover:bg-sage-light/30"
          }`}
        >
          Все
        </a>
        {Object.entries(applicationStatuses).map(([status, label]) => (
          <a
            key={status}
            href={`/admin?status=${status}`}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              filterStatus === status
                ? "bg-forest text-white"
                : "bg-sage-light/20 text-forest hover:bg-sage-light/30"
            }`}
          >
            {label}
          </a>
        ))}
      </div>

      <p className="text-sm text-forest/50">
        Показано заявок:{" "}
        <span className="font-semibold text-forest">{applicationsCount}</span>
      </p>
    </div>
  );
}
