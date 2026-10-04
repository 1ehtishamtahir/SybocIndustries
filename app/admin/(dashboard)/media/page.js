import { prisma } from "@/lib/db";
import MediaUploader from "@/components/admin/MediaUploader";
import MediaCopy from "@/components/admin/MediaCopy";
import DeleteButton from "@/components/admin/DeleteButton";

export const metadata = { title: "Media" };

const fmtSize = (b) => (b >= 1024 * 1024 ? `${(b / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1024))} KB`);

export default async function AdminMediaPage() {
  const media = await prisma.media.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <>
      <div className="admin-topbar">
        <div>
          <p className="admin-crumb">Library</p>
          <h1>Media</h1>
        </div>
      </div>

      <MediaUploader />

      {media.length === 0 ? (
        <div className="admin-empty">No uploads yet.</div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Preview</th>
                <th>Path</th>
                <th>Alt</th>
                <th>Size</th>
                <th>Uploaded</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {media.map((m) => (
                <tr key={m.id}>
                  <td>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={m.path}
                      alt={m.alt || m.originalName}
                      style={{ width: "56px", height: "40px", objectFit: "cover", borderRadius: "4px", background: "#111" }}
                    />
                  </td>
                  <td className="muted-cell">{m.path}</td>
                  <td className="muted-cell">{m.alt || "—"}</td>
                  <td className="muted-cell">{fmtSize(m.size)}</td>
                  <td className="muted-cell">
                    {new Date(m.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                  </td>
                  <td>
                    <div className="row-actions">
                      <MediaCopy path={m.path} />
                      <DeleteButton api={`/api/admin/media/${m.id}`} confirmMessage={`Delete ${m.filename}? The file is removed from disk.`} />
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
