import { redirect } from "next/navigation";
import { cookies } from "next/headers";

import { AdminLiveEditor } from "@/components/admin/admin-live-editor";
import { HomePageClient } from "@/components/home/home-page-client";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import {
  getHomePageContent,
  getHomepageArticles,
  getManagedContentPages,
} from "@/lib/content";

export default async function AdminLiveEditorPage() {
  const cookieStore = await cookies();
  if (!isAdminAuthenticated(cookieStore)) {
    redirect("/admin/login");
  }

  const [homeContent, articles, allPages] = await Promise.all([
    getHomePageContent(),
    getHomepageArticles(),
    getManagedContentPages(),
  ]);

  return (
    <AdminLiveEditor homeContent={homeContent} pages={allPages}>
      <HomePageClient articles={articles} homeContent={homeContent} previewMode />
    </AdminLiveEditor>
  );
}
