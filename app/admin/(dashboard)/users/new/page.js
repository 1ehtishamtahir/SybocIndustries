import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import UserForm from "@/components/admin/UserForm";

export const metadata = { title: "New user" };

export default async function NewUserPage() {
  await requireAdmin();

  return (
    <>
      <div className="admin-topbar">
        <div>
          <p className="admin-crumb">
            <Link href="/admin/users">Users</Link> / New
          </p>
          <h1>New user</h1>
        </div>
      </div>
      <UserForm />
    </>
  );
}
