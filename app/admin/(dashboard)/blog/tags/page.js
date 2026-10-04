import Link from "next/link";
import { prisma } from "@/lib/db";
import TaxonomyManager from "@/components/admin/TaxonomyManager";

export const metadata = { title: "Blog tags" };

export default async function AdminBlogTagsPage() {
  const tags = await prisma.tag.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { posts: true } } },
  });

  return (
    <>
      <div className="admin-topbar">
        <div>
          <p className="admin-crumb">
            <Link href="/admin/blog">Blog</Link> / Tags
          </p>
          <h1>Blog tags</h1>
        </div>
      </div>
      <TaxonomyManager kind="tags" items={tags} />
    </>
  );
}
