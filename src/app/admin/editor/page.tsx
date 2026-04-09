import { cookies } from "next/headers";

import { AdminContentEditor } from "@/components/admin/admin-content-editor";
import { AdminLogin } from "@/components/admin/admin-login";
import { AdminShell } from "@/components/admin/admin-shell";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getHomePageContent, getManagedContentPages } from "@/lib/content";

type AdminEditorPageProps = {
  searchParams?: Promise<{
    error?: string;
  }>;
};

export default async function AdminEditorPage({
  searchParams,
}: AdminEditorPageProps) {
  const params = (await searchParams) ?? {};
  const cookieStore = await cookies();

  if (!isAdminAuthenticated(cookieStore)) {
    return <AdminLogin error={params.error} />;
  }

  const [homeContent, pages] = await Promise.all([
    getHomePageContent(),
    getManagedContentPages(),
  ]);

  return (
    <AdminShell>
      <AdminContentEditor homeContent={homeContent} pages={pages} />
    </AdminShell>
  );
}
