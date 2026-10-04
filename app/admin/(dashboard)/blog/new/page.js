import Link from "next/link";
import { prisma } from "@/lib/db";
import PostForm from "@/components/admin/PostForm";

export const metadata = { title: "New post" };

export default async function NewPostPage() {
  const [categories, tags] = await Promise.all([
    prisma.category.findMany({ where: { type: "BLOG" }, orderBy: { name: "asc" } }),
    prisma.tag.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <>
      <div className="admin-topbar">
        <div>
          <p className="admin-crumb">
            <Link href="/admin/blog">Blog</Link> / New
          </p>
          <h1>New post</h1>
        </div>
      </div>
      <PostForm categories={categories} tags={tags} />
    </>
  );
}
