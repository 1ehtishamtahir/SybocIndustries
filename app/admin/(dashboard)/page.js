import Link from "next/link";
import { prisma } from "../../../lib/db";

export const dynamic = "force-dynamic";

const fmtDate = (d) =>
  new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

export default async function AdminDashboard() {
  const [
    pages,
    productsPublished,
    productsDraft,
    postsPublished,
    postsDraft,
    media,
    unread,
    submissions,
    users,
  ] = await Promise.all([
    prisma.page.count(),
    prisma.product.count({ where: { status: "PUBLISHED" } }),
    prisma.product.count({ where: { status: "DRAFT" } }),
    prisma.blogPost.count({ where: { status: "PUBLISHED" } }),
    prisma.blogPost.count({ where: { status: "DRAFT" } }),
    prisma.media.count(),
    prisma.contactSubmission.count({ where: { read: false } }),
    prisma.contactSubmission.findMany({
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
    prisma.adminUser.count(),
  ]);

  return (
    <>
      <div className="admin-topbar">
        <div>
          <p className="admin-crumb">Admin</p>
          <h1>Dashboard</h1>
        </div>
        <div className="admin-actions">
          <Link className="btn ghost dark" href="/admin/pages/new">
            New page
          </Link>
          <Link className="btn ghost dark" href="/admin/blog/new">
            New post
          </Link>
          <Link className="btn" href="/admin/submissions">
            Submissions{unread ? ` (${unread})` : ""}
          </Link>
        </div>
      </div>

      <div className="admin-grid">
        <div className="admin-card">
          <h3>Products</h3>
          <p className="stat">{productsPublished}</p>
          <p>
            published · {productsDraft} draft
          </p>
          <Link className="btn ghost dark" href="/admin/products">
            Manage
          </Link>
        </div>
        <div className="admin-card">
          <h3>Blog posts</h3>
          <p className="stat">{postsPublished}</p>
          <p>published · {postsDraft} draft</p>
          <Link className="btn ghost dark" href="/admin/blog">
            Manage
          </Link>
        </div>
        <div className="admin-card">
          <h3>Pages</h3>
          <p className="stat">{pages}</p>
          <p>CMS content pages</p>
          <Link className="btn ghost dark" href="/admin/pages">
            Manage
          </Link>
        </div>
        <div className="admin-card">
          <h3>Media</h3>
          <p className="stat">{media}</p>
          <p>files in the library</p>
          <Link className="btn ghost dark" href="/admin/media">
            Open
          </Link>
        </div>
        <div className="admin-card">
          <h3>Submissions</h3>
          <p className="stat">
            {unread}
            {unread > 0 && <small> unread</small>}
          </p>
          <p>quote &amp; contact requests</p>
          <Link className="btn ghost dark" href="/admin/submissions">
            Review
          </Link>
        </div>
        <div className="admin-card">
          <h3>Team</h3>
          <p className="stat">{users}</p>
          <p>admin accounts</p>
          <Link className="btn ghost dark" href="/admin/users">
            Manage
          </Link>
        </div>
      </div>

      <div className="admin-topbar" style={{ marginTop: "2rem" }}>
        <div>
          <h1 style={{ fontSize: "1.5rem" }}>Recent submissions</h1>
        </div>
      </div>

      {submissions.length === 0 ? (
        <div className="admin-empty">
          No quote or contact submissions yet.
          <div>
            <Link className="btn ghost dark" href="/admin/submissions">
              Open submissions
            </Link>
          </div>
        </div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Name</th>
                <th>Email</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((s) => (
                <tr key={s.id}>
                  <td className="muted-cell">{fmtDate(s.createdAt)}</td>
                  <td>{s.type}</td>
                  <td>{s.name}</td>
                  <td>
                    <a href={`mailto:${s.email}`}>{s.email}</a>
                  </td>
                  <td>{s.read ? <span className="badge">Read</span> : <span className="badge alert">New</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
