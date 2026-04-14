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

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-sage-light/15 bg-white/70 px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-forest/35">
        {label}
      </p>
      <p className="mt-2 break-all text-sm leading-6 text-forest/80">
        {value}
      </p>
    </div>
  );
}

function EmptyApplicationsState() {
  return (
    <div className="px-6 py-14 sm:px-8 sm:py-20">
      <div className="rounded-[2rem] border border-dashed border-sage-light/30 bg-gradient-to-br from-cream to-white px-6 py-16 text-center">
        <p className="text-2xl font-bold text-forest">Заявок пока нет</p>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-forest/55">
          Когда появятся новые обращения, здесь будут аккуратные карточки с
          номером заявки, каналом связи, временем записи и быстрым управлением
          статусом.
        </p>
      </div>
    </div>
  );
}

function ApplicationStatusCell({ application }: { application: Application }) {
  return (
    <form action="/admin/status" method="post" className="space-y-3">
      <input type="hidden" name="id" value={application.id} />
      <div className="flex items-center justify-between gap-3">
        <span
          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusBadgeClass(
            application.status,
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
          Сохранить
        </button>
      </div>
    </form>
  );
}

function ApplicationCard({ application }: { application: Application }) {
  const phone = normalizeOptionalValue(application.phone);
  const email = normalizeOptionalValue(application.email);
  const contactValue = normalizeOptionalValue(application.contactValue);
  const reason = normalizeOptionalValue(application.reason) || "Причина не указана";
  const contactMethod = getApplicationContactMethod(application.contactMethod);
  const applicationCode = formatApplicationNumber(
    application.id,
    application.verificationCode,
  );

  return (
    <article className="group relative overflow-hidden rounded-[2rem] border border-sage-light/20 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-sage/30 hover:shadow-xl">
      <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-br from-sage-light/35 via-cream to-transparent" />

      <div className="relative space-y-5">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-sage-dark">
              {formatSourceLabel(application.source)}
            </p>
            <div>
              <h3 className="text-xl font-bold text-forest">{application.name}</h3>
              <p className="mt-1 text-sm text-forest/55">
                {formatApplicationGender(application.gender)}
                {application.age ? `, ${application.age} лет` : ""}
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-sage-light/20 bg-white/90 px-4 py-3 text-right shadow-sm">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-forest/35">
              Номер
            </p>
            <p className="mt-2 text-sm font-semibold text-forest">{applicationCode}</p>
          </div>
        </div>

        <div className="rounded-[1.5rem] border border-sage-light/15 bg-cream/70 p-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-forest/35">
            Причина обращения
          </p>
          <p className="mt-3 text-sm leading-7 text-forest/80">{reason}</p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <InfoRow
            label="Запись"
            value={formatPreferredTime(application.preferredTime)}
          />
          <InfoRow label="Канал связи" value={contactMethod.label} />
          <InfoRow label="Телефон" value={phone || "Не указан"} />
          <InfoRow label="Email" value={email || "Не указан"} />
          <InfoRow
            label="Логин / адрес"
            value={contactValue || "Не указан"}
          />
          <InfoRow
            label="Создана"
            value={formatApplicationDate(application.createdAt)}
          />
        </div>

        <div className="rounded-[1.5rem] border border-sage-light/15 bg-white/80 p-5">
          <ApplicationStatusCell application={application} />
        </div>
      </div>
    </article>
  );
}

export function AdminApplicationsTable({
  applications,
}: AdminApplicationsTableProps) {
  if (applications.length === 0) {
    return <EmptyApplicationsState />;
  }

  return (
    <div className="px-6 py-6 sm:px-8 sm:py-8">
      <div className="grid gap-6 lg:grid-cols-2 2xl:grid-cols-3">
        {applications.map((application) => (
          <ApplicationCard key={application.id} application={application} />
        ))}
      </div>
    </div>
  );
}
