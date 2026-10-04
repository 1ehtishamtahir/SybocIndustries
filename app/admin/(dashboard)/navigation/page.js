import { prisma } from "@/lib/db";
import NavigationEditor from "@/components/admin/NavigationEditor";

export const metadata = { title: "Navigation" };

export default async function AdminNavigationPage() {
  const items = await prisma.navigationItem.findMany({ orderBy: [{ menu: "asc" }, { order: "asc" }] });

  return (
    <>
      <div className="admin-topbar">
        <div>
          <p className="admin-crumb">Site structure</p>
          <h1>Navigation</h1>
        </div>
      </div>
      <NavigationEditor items={items} />
    </>
  );
}
