import { cookies } from "next/headers";
import { db } from "@/lib/db";
import {
  applicationStatuses,
  formatApplicationDate,
  formatApplicationNumber,
} from "@/lib/applications";
import {
  isAdminAuthenticated,
  isAdminPasswordConfigured,
} from "@/lib/admin-auth";

type AdminPageProps = {
  searchParams?: Promise<{
    status?: string;
    error?: string;
  }>;
};

function statusBadgeClass(status: string) {
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

function AdminLogin({ error }: { error?: string }) {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(143,174,139,0.25),_transparent_45%),linear-gradient(180deg,_#fdfbf7_0%,_#f4efe6_100%)] px-4 py-10 text-forest">
      <div className="mx-auto flex min-h-[80vh] max-w-md items-center">
        <div className="w-full rounded-[2rem] border border-sage-light/30 bg-white/90 p-8 shadow-xl backdrop-blur">
          <div className="mb-6 space-y-2 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-sage-dark">
              Админ-панель
            </p>
            <h1 className="text-3xl font-bold">Вход для менеджера</h1>
            <p className="text-sm text-forest/60">
              Введите пароль, чтобы просматривать заявки с сайта.
            </p>
          </div>

          <form action="/admin/login" method="post" className="space-y-4">
            <label className="block space-y-2">
              <span className="text-sm font-medium">Пароль</span>
              <input
                type="password"
                name="password"
                required
                className="h-12 w-full rounded-xl border border-sage-light/40 bg-cream px-4 outline-none transition focus:border-sage"
              />
            </label>

            {error === "invalid_password" ? (
              <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
                Неверный пароль.
              </p>
            ) : null}

            <button
              type="submit"
              className="h-12 w-full rounded-xl bg-gradient-to-r from-sage to-sage-dark font-semibold text-white shadow-lg transition hover:from-sage-dark hover:to-forest"
            >
              Войти
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const params = (await searchParams) ?? {};
  const cookieStore = await cookies();
  const isAuthenticated = isAdminAuthenticated(cookieStore);
  const filterStatus =
    typeof params.status === "string" && params.status in applicationStatuses
      ? params.status
      : undefined;

  if (!isAuthenticated) {
    return <AdminLogin error={params.error} />;
  }

  const [applications, stats] = await Promise.all([
    db.application.findMany({
      where: filterStatus ? { status: filterStatus } : undefined,
      orderBy: { createdAt: "desc" },
    }),
    db.application.groupBy({
      by: ["status"],
      _count: true,
    }),
  ]);

  const totals = stats.reduce<Record<string, number>>((acc, item) => {
    acc[item.status] = item._count;
    return acc;
  }, {});

  const totalApplications = await db.application.count();

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(143,174,139,0.22),_transparent_42%),linear-gradient(180deg,_#fdfbf7_0%,_#f6f0e7_100%)] px-4 py-6 text-forest sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="overflow-hidden rounded-[2rem] border border-sage-light/30 bg-white/85 shadow-xl backdrop-blur">
          <div className="flex flex-col gap-5 border-b border-sage-light/20 px-6 py-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-sage-dark">
                LAD CRM
              </p>
              <div>
                <h1 className="text-3xl font-bold sm:text-4xl">Заявки с сайта</h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-forest/60">
                  Здесь сохраняются все обращения с формы. У каждой заявки есть
                  свой номер, статус и время создания.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              {!isAdminPasswordConfigured() ? (
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

        <section className="rounded-[2rem] border border-sage-light/30 bg-white/90 shadow-lg">
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
              <span className="font-semibold text-forest">{applications.length}</span>
            </p>
          </div>

          {applications.length === 0 ? (
            <div className="px-6 py-20 text-center">
              <p className="text-lg font-semibold">Заявок пока нет</p>
              <p className="mt-2 text-sm text-forest/50">
                Когда посетители начнут отправлять форму, они появятся здесь.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left">
                <thead className="bg-cream/80 text-sm text-forest/60">
                  <tr>
                    <th className="px-6 py-4 font-medium">Номер</th>
                    <th className="px-6 py-4 font-medium">Клиент</th>
                    <th className="px-6 py-4 font-medium">Контакты</th>
                    <th className="px-6 py-4 font-medium">Причина</th>
                    <th className="px-6 py-4 font-medium">Статус</th>
                    <th className="px-6 py-4 font-medium">Создана</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map((application) => (
                    <tr
                      key={application.id}
                      className="border-t border-sage-light/15 align-top"
                    >
                      <td className="px-6 py-5">
                        <div className="font-semibold text-forest">
                          {formatApplicationNumber(application.id)}
                        </div>
                        <div className="mt-1 text-xs uppercase tracking-[0.2em] text-forest/35">
                          {application.source}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="font-medium">{application.name}</div>
                      </td>
                      <td className="px-6 py-5 text-sm leading-6 text-forest/70">
                        <div>{application.phone}</div>
                        <div>{application.email}</div>
                      </td>
                      <td className="max-w-md px-6 py-5 text-sm leading-6 text-forest/75">
                        {application.reason}
                      </td>
                      <td className="px-6 py-5">
                        <div className="space-y-3">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusBadgeClass(
                              application.status
                            )}`}
                          >
                            {applicationStatuses[
                              application.status as keyof typeof applicationStatuses
                            ] ?? application.status}
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
                      </td>
                      <td className="px-6 py-5 text-sm text-forest/60">
                        {formatApplicationDate(application.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
