import Link from "next/link";
import { prisma } from "@/lib/db";
import TaxonomyManager from "@/components/admin/TaxonomyManager";

export const metadata = { title: "Blog categories" };

export default async function AdminBlogCategoriesPage() {
  const categories = await prisma.category.findMany({
    where: { type: "BLOG" },
    orderBy: { name: "asc" },
    include: { _count: { select: { posts: true } } },
  });

  return (
    <>
      <div className="admin-topbar">
        <div>
          <p className="admin-crumb">
            <Link href="/admin/blog">Blog</Link> / Categories
          </p>
          <h1>Blog categories</h1>
        </div>
      </div>
      <TaxonomyManager kind="categories" items={categories} />
    </>
  );
}
