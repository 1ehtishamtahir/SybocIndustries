import Link from "next/link";
import { prisma } from "@/lib/db";
import DeleteButton from "@/components/admin/DeleteButton";

const fmtDate = (d) =>
  new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    orderBy: { order: "asc" },
    include: { category: true },
  });

  return (
    <>
      <div className="admin-topbar">
        <div>
          <p className="admin-crumb">Catalogue</p>
          <h1>Suits</h1>
        </div>
        <div className="admin-actions">
          <Link className="btn" href="/admin/products/new">
            New suit
          </Link>
        </div>
      </div>

      {products.length === 0 ? (
        <div className="admin-empty">
          No suits yet. Add the products shown in the public catalogue.
          <div>
            <Link className="btn" href="/admin/products/new">
              New suit
            </Link>
          </div>
        </div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Status</th>
                <th>Order</th>
                <th>Updated</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td>
                    <Link href={`/admin/products/${p.id}`}>{p.name}</Link>
                    <div className="muted-cell">/suits/{p.slug}</div>
                  </td>
                  <td className="muted-cell">{p.category?.name || "—"}</td>
                  <td className="muted-cell">
                    {p.price != null ? `R ${Number(p.price).toLocaleString("en-ZA")}` : p.priceNote || "—"}
                  </td>
                  <td>
                    {p.status === "PUBLISHED" ? (
                      <span className="badge ok">Published</span>
                    ) : (
                      <span className="badge draft">Draft</span>
                    )}
                  </td>
                  <td className="muted-cell">{p.order}</td>
                  <td className="muted-cell">{fmtDate(p.updatedAt)}</td>
                  <td>
                    <div className="row-actions">
                      <Link className="btn ghost dark" href={`/admin/products/${p.id}`}>
                        Edit
                      </Link>
                      <DeleteButton
                        api={`/api/admin/products/${p.id}`}
                        confirmMessage={`Delete suit "${p.name}"?`}
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
