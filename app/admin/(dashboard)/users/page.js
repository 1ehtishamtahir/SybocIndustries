import Link from "next/link";
import { requireAdmin, getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import DeleteButton from "@/components/admin/DeleteButton";

export const metadata = { title: "Users" };

export default async function AdminUsersPage() {
  await requireAdmin();
  const me = await getCurrentUser();
  const users = await prisma.adminUser.findMany({
    select: { id: true, name: true, email: true, role: true, createdAt: true, lastLoginAt: true },
    orderBy: { createdAt: "asc" },
  });

  return (
    <>
      <div className="admin-topbar">
        <div>
          <p className="admin-crumb">Administration</p>
          <h1>Users</h1>
        </div>
        <div className="admin-actions">
          <Link className="btn" href="/admin/users/new">
            New user
          </Link>
        </div>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Last login</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>
                  <Link href={`/admin/users/${u.id}`}>{u.name}</Link>
                  {u.id === me?.id && <span className="muted-cell"> (you)</span>}
                </td>
                <td className="muted-cell">{u.email}</td>
                <td>
                  {u.role === "ADMIN" ? <span className="badge ok">Admin</span> : <span className="badge draft">Editor</span>}
                </td>
                <td className="muted-cell">
                  {u.lastLoginAt
                    ? new Date(u.lastLoginAt).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })
                    : "Never"}
                </td>
                <td>
                  <div className="row-actions">
                    <Link className="btn ghost dark" href={`/admin/users/${u.id}`}>
                      Edit
                    </Link>
                    {u.id !== me?.id && (
                      <DeleteButton
                        api={`/api/admin/users/${u.id}`}
                        confirmMessage={`Delete user "${u.name}"?`}
                      />
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
