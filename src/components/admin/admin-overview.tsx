import { applicationStatuses } from "@/lib/applications";

type AdminOverviewProps = {
  totalApplications: number;
  totals: Record<string, number>;
  isPasswordConfigured: boolean;
};

export function AdminOverview({
  totalApplications,
  totals,
  isPasswordConfigured,
}: AdminOverviewProps) {
  return (
    <section className="overflow-hidden rounded-[2rem] border border-sage-light/30 bg-white/85 shadow-xl backdrop-blur">
      <div className="flex flex-col gap-5 border-b border-sage-light/20 px-6 py-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-sage-dark">
            LAD CRM
          </p>
          <div>
            <h1 className="text-3xl font-bold sm:text-4xl">Заявки с сайта</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-forest/60">
              Здесь сохраняются все обращения с формы. У каждой заявки есть свой
              номер, статус и время создания.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          {!isPasswordConfigured ? (
            <div className="rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
              Пароль для админки не задан. Добавьте `ADMIN_PASSWORD` в `.env`.
            </div>
          ) : (
            <form action="/admin/logout" method="post">
              <button
                type="submit"
                className="rounded-xl border border-sage-light/40 px-4 py-3 text-sm font-medium transition hover:bg-sage-light/15"
              >
                Выйти
              </button>
            </form>
          )}
        </div>
      </div>

      <div className="grid gap-4 px-6 py-6 sm:grid-cols-2 xl:grid-cols-5">
        <div className="rounded-2xl bg-cream p-5">
          <p className="text-sm text-forest/50">Всего заявок</p>
          <p className="mt-2 text-3xl font-bold">{totalApplications}</p>
        </div>
        {Object.entries(applicationStatuses).map(([status, label]) => (
          <a
            key={status}
            href={`/admin?status=${status}`}
            className="rounded-2xl bg-white p-5 ring-1 ring-sage-light/20 transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <p className="text-sm text-forest/50">{label}</p>
            <p className="mt-2 text-3xl font-bold">{totals[status] ?? 0}</p>
          </a>
        ))}
      </div>
    </section>
  );
}
