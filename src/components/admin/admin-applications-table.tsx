import type { Application } from "@prisma/client";

import {
  applicationStatuses,
  formatApplicationDate,
  formatApplicationGender,
  formatApplicationNumber,
  formatPreferredTime,
  getApplicationContactMethod,
  getApplicationStatusLabel,
} from "@/lib/applications";

import { statusBadgeClass } from "./admin-utils";

type AdminApplicationsTableProps = {
  applications: Application[];
};

function normalizeOptionalValue(value?: string | null) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function formatSourceLabel(value?: string | null) {
  switch (value?.trim().toLowerCase()) {
    case "website":
      return "Сайт";
    case "telegram":
      return "Telegram";
    case "vk":
      return "VK";
    case "discord":
      return "Discord";
    default:
      return value || "Не указан";
  }
}

function EmptyApplicationsState() {
  return (
    <div className="px-6 py-20 text-center">
      <p className="text-lg font-semibold">Заявок пока нет</p>
      <p className="mt-2 text-sm text-forest/50">
        Когда посетители начнут отправлять форму, они появятся здесь.
      </p>
    </div>
  );
}

function ApplicationStatusCell({ application }: { application: Application }) {
  return (
    <div className="space-y-3">
      <span
        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusBadgeClass(
          application.status,
        )}`}
      >
        {getApplicationStatusLabel(application.status)}
      </span>

      <form action="/admin/status" method="post" className="space-y-2">
        <input type="hidden" name="id" value={application.id} />
        <select
          name="status"
          defaultValue={application.status}
          className="w-full rounded-xl border border-sage-light/30 bg-white px-3 py-2 text-sm outline-none transition focus:border-sage"
        >
          {Object.entries(applicationStatuses).map(([status, label]) => (
            <option key={status} value={status}>
              {label}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="w-full rounded-xl bg-sage-light/25 px-3 py-2 text-sm font-medium transition hover:bg-sage-light/35"
        >
          Сохранить
        </button>
      </form>
    </div>
  );
}

export function AdminApplicationsTable({
  applications,
}: AdminApplicationsTableProps) {
  if (applications.length === 0) {
    return <EmptyApplicationsState />;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-left">
        <thead className="bg-cream/80 text-sm text-forest/60">
          <tr>
            <th className="px-6 py-4 font-medium">Номер</th>
            <th className="px-6 py-4 font-medium">Клиент</th>
            <th className="px-6 py-4 font-medium">Контакты</th>
            <th className="px-6 py-4 font-medium">Запись</th>
            <th className="px-6 py-4 font-medium">Причина</th>
            <th className="px-6 py-4 font-medium">Статус</th>
            <th className="px-6 py-4 font-medium">Создана</th>
          </tr>
        </thead>
        <tbody>
          {applications.map((application) => {
            const phone = normalizeOptionalValue(application.phone);
            const email = normalizeOptionalValue(application.email);
            const contactValue = normalizeOptionalValue(application.contactValue);
            const contactMethod = getApplicationContactMethod(
              application.contactMethod,
            );

            return (
              <tr
                key={application.id}
                className="border-t border-sage-light/15 align-top"
              >
                <td className="px-6 py-5">
                  <div className="font-semibold text-forest">
                    {formatApplicationNumber(
                      application.id,
                      application.verificationCode,
                    )}
                  </div>
                  <div className="mt-1 text-xs uppercase tracking-[0.2em] text-forest/35">
                    {formatSourceLabel(application.source)}
                  </div>
                </td>

                <td className="px-6 py-5">
                  <div className="font-medium text-forest">{application.name}</div>
                  <div className="mt-1 text-xs text-forest/45">
                    {formatApplicationGender(application.gender)}
                    {application.age ? `, ${application.age} лет` : ""}
                  </div>
                </td>

                <td className="px-6 py-5 text-sm leading-6 text-forest/70">
                  <div>{phone || "Телефон не указан"}</div>
                  <div>{email || "Email не указан"}</div>
                  <div className="mt-2 font-medium text-forest">
                    {contactMethod.label}
                  </div>
                  <div className="text-xs text-forest/45">
                    {contactValue || "Логин или адрес не указаны"}
                  </div>
                </td>

                <td className="px-6 py-5 text-sm leading-6 text-forest/70">
                  <div>{formatPreferredTime(application.preferredTime)}</div>
                  <div className="mt-2 text-xs text-forest/45">
                    Код:{" "}
                    {formatApplicationNumber(
                      application.id,
                      application.verificationCode,
                    )}
                  </div>
                </td>

                <td className="max-w-md px-6 py-5 text-sm leading-6 text-forest/75">
                  {normalizeOptionalValue(application.reason) ||
                    "Причина не указана"}
                </td>

                <td className="px-6 py-5">
                  <ApplicationStatusCell application={application} />
                </td>

                <td className="px-6 py-5 text-sm text-forest/60">
                  {formatApplicationDate(application.createdAt)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
