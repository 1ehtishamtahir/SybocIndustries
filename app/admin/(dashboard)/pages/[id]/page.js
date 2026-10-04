import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import PageForm from "@/components/admin/PageForm";

export const metadata = { title: "Edit page" };

export default async function EditPagePage({ params }) {
  const { id } = await params;
  const page = await prisma.page.findUnique({ where: { id } });
  if (!page) notFound();

  return (
    <>
      <div className="admin-topbar">
        <div>
          <p className="admin-crumb">
            <Link href="/admin/pages">Pages</Link> / Edit
          </p>
          <h1>{page.title}</h1>
        </div>
      </div>
      <PageForm page={page} />
    </>
  );
}
