import { Prisma, type Application } from "@prisma/client";

import { applicationStatuses, type ApplicationStatus } from "@/lib/applications";
import { db } from "@/lib/db";

type AdminApplicationRow = {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  gender: string | null;
  age: number | null;
  reason: string;
  preferredTime: string | null;
  contactMethod: string | null;
  contactValue: string | null;
  verificationCode: string | null;
  telegramId: string | null;
  source: string;
  status: string;
  createdAt: Date | string;
  updatedAt: Date | string;
};

type AdminStatusCountRow = {
  status: string;
  count: number;
};

type AdminTotalCountRow = {
  count: number;
};

export type AdminDashboardData = {
  applications: Application[];
  totals: Record<string, number>;
  totalApplications: number;
};

function normalizeDate(value: Date | string) {
  return value instanceof Date ? value : new Date(value);
}

function mapAdminApplication(row: AdminApplicationRow): Application {
  return {
    ...row,
    createdAt: normalizeDate(row.createdAt),
    updatedAt: normalizeDate(row.updatedAt),
  };
}

export async function getAdminDashboardData(
  filterStatus?: ApplicationStatus,
): Promise<AdminDashboardData> {
  try {
    const whereClause = filterStatus
      ? Prisma.sql`where coalesce("status", 'new') = ${filterStatus}`
      : Prisma.empty;

    const [applicationRows, stats, totalRows] = await Promise.all([
      db.$queryRaw<AdminApplicationRow[]>(Prisma.sql`
        select
          "id",
          "name",
          "email",
          "phone",
          "gender",
          "age",
          "reason",
          "preferredTime",
          "contactMethod",
          "contactValue",
          "verificationCode",
          "telegramId",
          "source",
          coalesce("status", 'new') as "status",
          "createdAt",
          "updatedAt"
        from "Application"
        ${whereClause}
        order by "createdAt" desc
      `),
      db.$queryRaw<AdminStatusCountRow[]>(Prisma.sql`
        select
          coalesce("status", 'new') as "status",
          count(*)::int as "count"
        from "Application"
        group by coalesce("status", 'new')
      `),
      db.$queryRaw<AdminTotalCountRow[]>(Prisma.sql`
        select count(*)::int as "count"
        from "Application"
      `),
    ]);

    const totals = stats.reduce<Record<string, number>>((accumulator, item) => {
      accumulator[item.status] = Number(item.count) || 0;
      return accumulator;
    }, {});

    for (const status of Object.keys(applicationStatuses)) {
      totals[status] ??= 0;
    }

    return {
      applications: applicationRows.map(mapAdminApplication),
      totals,
      totalApplications: Number(totalRows[0]?.count) || 0,
    };
  } catch (error) {
    console.error("Failed to fetch admin dashboard data:", error);

    return {
      applications: [],
      totals: Object.keys(applicationStatuses).reduce<Record<string, number>>(
        (accumulator, status) => {
          accumulator[status] = 0;
          return accumulator;
        },
        {},
      ),
      totalApplications: 0,
    };
  }
}
