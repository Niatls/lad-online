import { cookies } from "next/headers";

import { AdminApplicationsTable } from "@/components/admin/admin-applications-table";
import { AdminFilters } from "@/components/admin/admin-filters";
import { AdminLogin } from "@/components/admin/admin-login";
import { AdminOverview } from "@/components/admin/admin-overview";
import { AdminShell } from "@/components/admin/admin-shell";
import { db } from "@/lib/db";
import { applicationStatuses } from "@/lib/applications";
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

  const [applications, stats, totalApplications] = await Promise.all([
    db.application.findMany({
      where: filterStatus ? { status: filterStatus } : undefined,
      orderBy: { createdAt: "desc" },
    }),
    db.application.groupBy({
      by: ["status"],
      _count: true,
    }),
    db.application.count(),
  ]);

  const totals = stats.reduce<Record<string, number>>((accumulator, item) => {
    accumulator[item.status] = item._count;
    return accumulator;
  }, {});

  return (
    <AdminShell>
      <AdminOverview
        totalApplications={totalApplications}
        totals={totals}
        isPasswordConfigured={isAdminPasswordConfigured()}
      />

      <section className="rounded-[2rem] border border-sage-light/30 bg-white/90 shadow-lg">
        <AdminFilters
          filterStatus={filterStatus}
          applicationsCount={applications.length}
        />
        <AdminApplicationsTable applications={applications} />
      </section>
    </AdminShell>
  );
}
