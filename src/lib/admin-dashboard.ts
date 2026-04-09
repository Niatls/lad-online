import type { Prisma } from "@prisma/client";

import { applicationStatuses, type ApplicationStatus } from "@/lib/applications";
import { db } from "@/lib/db";

export type AdminDashboardData = {
  applications: Awaited<ReturnType<typeof db.application.findMany>>;
  totals: Record<string, number>;
  totalApplications: number;
};

export async function getAdminDashboardData(
  filterStatus?: ApplicationStatus
): Promise<AdminDashboardData> {
  const where: Prisma.ApplicationWhereInput | undefined = filterStatus
    ? { status: filterStatus }
    : undefined;

  const [applications, stats, totalApplications] = await Promise.all([
    db.application.findMany({
      where,
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

  for (const status of Object.keys(applicationStatuses)) {
    totals[status] ??= 0;
  }

  return {
    applications,
    totals,
    totalApplications,
  };
}
