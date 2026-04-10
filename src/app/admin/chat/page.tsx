import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminChatPanel } from "@/components/admin/admin-chat-panel";

export default async function AdminChatPage() {
  const cookieStore = await cookies();
  if (!isAdminAuthenticated(cookieStore)) {
    redirect("/admin/login");
  }

  return (
    <AdminShell>
      <AdminChatPanel />
    </AdminShell>
  );
}
