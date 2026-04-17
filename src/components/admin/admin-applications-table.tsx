import type { Application } from "@prisma/client";

import { ApplicationCard } from "@/components/admin/admin-applications-table/application-card";
import { EmptyApplicationsState } from "@/components/admin/admin-applications-table/empty-state";

type AdminApplicationsTableProps = {
  applications: Application[];
};

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