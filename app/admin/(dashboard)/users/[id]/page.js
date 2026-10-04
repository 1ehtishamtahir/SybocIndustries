import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin, getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import UserForm from "@/components/admin/UserForm";

export const metadata = { title: "Edit user" };

export default async function EditUserPage({ params }) {
  await requireAdmin();
  const { id } = await params;
  const [user, me] = await Promise.all([
    prisma.adminUser.findUnique({
      where: { id },
      select: { id: true, name: true, email: true, role: true },
    }),
    getCurrentUser(),
  ]);
  if (!user) notFound();

  return (
    <>
      <div className="admin-topbar">
        <div>
          <p className="admin-crumb">
            <Link href="/admin/users">Users</Link> / Edit
          </p>
          <h1>{user.name}</h1>
        </div>
      </div>
      <UserForm user={user} selfId={me?.id} />
    </>
  );
}
