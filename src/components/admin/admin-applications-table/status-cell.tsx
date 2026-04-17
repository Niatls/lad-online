import type { Application } from "@prisma/client";

import {
  applicationStatuses,
  formatApplicationDate,
  getApplicationStatusLabel,
} from "@/lib/applications";

import { statusBadgeClass } from "../admin-utils";

type ApplicationStatusCellProps = {
  application: Application;
};

export function ApplicationStatusCell({
  application,
}: ApplicationStatusCellProps) {
  return (
    <form action="/admin/status" method="post" className="space-y-3">
      <input type="hidden" name="id" value={application.id} />
      <div className="flex items-center justify-between gap-3">
        <span
          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusBadgeClass(
            application.status
          )}`}
        >
          {getApplicationStatusLabel(application.status)}
        </span>
        <span className="text-xs text-forest/40">
          {formatApplicationDate(application.createdAt)}
        </span>
      </div>

      <div className="flex gap-2">
        <select
          name="status"
          defaultValue={application.status}
          className="h-11 flex-1 rounded-xl border border-sage-light/30 bg-white px-3 text-sm outline-none transition focus:border-sage"
        >
          {Object.entries(applicationStatuses).map(([status, label]) => (
            <option key={status} value={status}>
              {label}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="rounded-xl bg-gradient-to-r from-sage to-sage-dark px-4 text-sm font-medium text-white transition hover:from-sage-dark hover:to-forest"
        >
          {"\u0421\u043e\u0445\u0440\u0430\u043d\u0438\u0442\u044c"}
        </button>
      </div>
    </form>
  );
}
