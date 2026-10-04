import Link from "next/link";
import { prisma } from "@/lib/db";
import DeleteButton from "@/components/admin/DeleteButton";

const fmtDate = (d) =>
  new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

export default async function AdminPagesPage() {
  const pages = await prisma.page.findMany({ orderBy: { updatedAt: "desc" } });

  return (
    <>
      <div className="admin-topbar">
        <div>
          <p className="admin-crumb">Content</p>
          <h1>Pages</h1>
        </div>
        <div className="admin-actions">
          <Link className="btn" href="/admin/pages/new">
            New page
          </Link>
        </div>
      </div>

      {pages.length === 0 ? (
        <div className="admin-empty">
          No CMS pages yet. Create content pages like terms, sizing guides or dealer info.
          <div>
            <Link className="btn" href="/admin/pages/new">
              New page
            </Link>
          </div>
        </div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Slug</th>
                <th>Status</th>
                <th>Updated</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {pages.map((p) => (
                <tr key={p.id}>
                  <td>
                    <Link href={`/admin/pages/${p.id}`}>{p.title}</Link>
                  </td>
                  <td className="muted-cell">/{p.slug}</td>
                  <td>
                    {p.status === "PUBLISHED" ? (
                      <span className="badge ok">Published</span>
                    ) : (
                      <span className="badge draft">Draft</span>
                    )}
                  </td>
                  <td className="muted-cell">{fmtDate(p.updatedAt)}</td>
                  <td>
                    <div className="row-actions">
                      <Link className="btn ghost dark" href={`/admin/pages/${p.id}`}>
                        Edit
                      </Link>
                      <DeleteButton
                        api={`/api/admin/pages/${p.id}`}
                        confirmMessage={`Delete page "${p.title}"?`}
                      />
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
