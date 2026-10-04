import Link from "next/link";
import { prisma } from "@/lib/db";
import DeleteButton from "@/components/admin/DeleteButton";

const fmtDate = (d) =>
  new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

export default async function AdminBlogPage() {
  const posts = await prisma.blogPost.findMany({
    orderBy: { createdAt: "desc" },
    include: { category: true, tags: true },
  });

  return (
    <>
      <div className="admin-topbar">
        <div>
          <p className="admin-crumb">Content</p>
          <h1>Blog posts</h1>
        </div>
        <div className="admin-actions">
          <Link className="btn ghost dark" href="/admin/blog/categories">
            Categories
          </Link>
          <Link className="btn ghost dark" href="/admin/blog/tags">
            Tags
          </Link>
          <Link className="btn" href="/admin/blog/new">
            New post
          </Link>
        </div>
      </div>

      {posts.length === 0 ? (
        <div className="admin-empty">
          No posts yet. Publish news, event reports and buying guides.
          <div>
            <Link className="btn" href="/admin/blog/new">
              New post
            </Link>
          </div>
        </div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Category</th>
                <th>Tags</th>
                <th>Status</th>
                <th>Created</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {posts.map((p) => (
                <tr key={p.id}>
                  <td>
                    <Link href={`/admin/blog/${p.id}`}>{p.title}</Link>
                    <div className="muted-cell">/blog/{p.slug}</div>
                  </td>
                  <td className="muted-cell">{p.category?.name || "—"}</td>
                  <td className="muted-cell">{p.tags.map((t) => t.name).join(", ") || "—"}</td>
                  <td>
                    {p.status === "PUBLISHED" ? (
                      <span className="badge ok">Published</span>
                    ) : (
                      <span className="badge draft">Draft</span>
                    )}
                  </td>
                  <td className="muted-cell">{fmtDate(p.createdAt)}</td>
                  <td>
                    <div className="row-actions">
                      <Link className="btn ghost dark" href={`/admin/blog/${p.id}`}>
                        Edit
                      </Link>
                      <DeleteButton api={`/api/admin/posts/${p.id}`} confirmMessage={`Delete post "${p.title}"?`} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
