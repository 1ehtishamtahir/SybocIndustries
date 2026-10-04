import Link from "next/link";
import PageForm from "@/components/admin/PageForm";

export const metadata = { title: "New page" };

export default function NewPagePage() {
  return (
    <>
      <div className="admin-topbar">
        <div>
          <p className="admin-crumb">
            <Link href="/admin/pages">Pages</Link> / New
          </p>
          <h1>New page</h1>
        </div>
      </div>
      <PageForm />
    </>
  );
}
