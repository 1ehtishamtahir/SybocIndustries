import Link from "next/link";
import { prisma } from "@/lib/db";
import SubmissionRowActions from "@/components/admin/SubmissionRowActions";

export const metadata = { title: "Submissions" };

const fmtDateTime = (d) =>
  new Date(d).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

export default async function AdminSubmissionsPage() {
  const submissions = await prisma.contactSubmission.findMany({ orderBy: { createdAt: "desc" }, take: 200 });
  const counts = {
    all: submissions.length,
    unread: submissions.filter((s) => !s.read).length,
    quote: submissions.filter((s) => s.type === "QUOTE").length,
    contact: submissions.filter((s) => s.type === "CONTACT").length,
  };

  return (
    <>
      <div className="admin-topbar">
        <div>
          <p className="admin-crumb">Inbox</p>
          <h1>Submissions</h1>
        </div>
        <div className="admin-actions">
          <span className="badge ok">
            {counts.unread} unread
          </span>
          <span className="badge draft">{counts.quote} quotes</span>
          <span className="badge draft">{counts.contact} contact</span>
        </div>
      </div>

      {submissions.length === 0 ? (
        <div className="admin-empty">
          No submissions yet. Quote and contact forms will appear here.
          <div>
            <Link className="btn ghost dark" href="/quote">
              Preview quote form
            </Link>
          </div>
        </div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>From</th>
                <th>Type</th>
                <th>Message</th>
                <th>Received</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {submissions.map((s) => (
                <tr key={s.id} style={s.read ? undefined : { background: "rgba(225,6,0,.05)" }}>
                  <td>
                    <strong>{s.name}</strong>
                    <div className="muted-cell">
                      <a href={`mailto:${s.email}`}>{s.email}</a>
                    </div>
                    {s.phone && <div className="muted-cell">{s.phone}</div>}
                  </td>
                  <td>
                    {s.type === "QUOTE" ? <span className="badge ok">Quote</span> : <span className="badge draft">Contact</span>}
                  </td>
                  <td style={{ maxWidth: "28rem" }}>
                    <span style={{ display: "block", whiteSpace: "pre-wrap" }}>{s.message}</span>
                  </td>
                  <td className="muted-cell">{fmtDateTime(s.createdAt)}</td>
                  <td>
                    <SubmissionRowActions id={s.id} read={s.read} />
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
