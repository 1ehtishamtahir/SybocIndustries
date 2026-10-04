import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import PostForm from "@/components/admin/PostForm";

export const metadata = { title: "Edit post" };

export default async function EditPostPage({ params }) {
  const { id } = await params;
  const [post, categories, tags] = await Promise.all([
    prisma.blogPost.findUnique({ where: { id }, include: { tags: true } }),
    prisma.category.findMany({ where: { type: "BLOG" }, orderBy: { name: "asc" } }),
    prisma.tag.findMany({ orderBy: { name: "asc" } }),
  ]);
  if (!post) notFound();

  return (
    <>
      <div className="admin-topbar">
        <div>
          <p className="admin-crumb">
            <Link href="/admin/blog">Blog</Link> / Edit
          </p>
          <h1>{post.title}</h1>
        </div>
      </div>
      <PostForm post={post} categories={categories} tags={tags} />
    </>
  );
}
