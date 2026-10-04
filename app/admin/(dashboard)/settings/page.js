import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import SettingsForm from "@/components/admin/SettingsForm";

export const metadata = { title: "Settings" };

export default async function AdminSettingsPage() {
  await requireAdmin();
  const settings = await prisma.setting.findMany({ orderBy: [{ group: "asc" }, { key: "asc" }] });

  return (
    <>
      <div className="admin-topbar">
        <div>
          <p className="admin-crumb">Configuration</p>
          <h1>Settings</h1>
        </div>
      </div>
      <SettingsForm settings={settings} />
    </>
  );
}
