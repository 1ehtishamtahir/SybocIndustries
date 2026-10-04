import "../admin.css";
import Sidebar from "../../../components/admin/Sidebar";
import { requireUser } from "../../../lib/auth";

export const metadata = {
  robots: { index: false },
};

export default async function AdminLayout({ children }) {
  const user = await requireUser();
  return (
    <div className="admin-shell">
      <Sidebar user={user} />
      <main className="admin-main">{children}</main>
    </div>
  );
}
