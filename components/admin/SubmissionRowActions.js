"use client";
import { useRouter } from "next/navigation";
import DeleteButton from "./DeleteButton";

export default function SubmissionRowActions({ id, read }) {
  const router = useRouter();

  async function toggleRead() {
    await fetch(`/api/admin/submissions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ read: !read }),
    });
    router.refresh();
  }

  return (
    <div className="row-actions">
      <button className="btn ghost dark" type="button" onClick={toggleRead}>
        {read ? "Mark unread" : "Mark read"}
      </button>
      <DeleteButton api={`/api/admin/submissions/${id}`} confirmMessage="Delete this submission?" />
    </div>
  );
}
