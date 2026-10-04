"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";

const links = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/pages", label: "Pages" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/blog", label: "Blog" },
  { href: "/admin/media", label: "Media" },
  { href: "/admin/navigation", label: "Navigation" },
  { href: "/admin/submissions", label: "Submissions" },
  { href: "/admin/settings", label: "Settings", adminOnly: true },
  { href: "/admin/users", label: "Users", adminOnly: true },
];

export default function Sidebar({ user }) {
  const pathname = usePathname();
  const router = useRouter();
  const isAdmin = user?.role === "ADMIN";

  async function onLogout() {
    await fetch("/api/admin/auth/logout", { method: "POST" }).catch(() => {});
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <aside className="admin-side">
      <Link href="/admin" className="admin-brand">
        <Image src="/logo.png" alt="" width={60} height={36} />
        First&nbsp;Moto <span>CMS</span>
      </Link>
      <nav className="admin-nav" aria-label="Admin">
        {links
          .filter((l) => !l.adminOnly || isAdmin)
          .map((l) => {
            const active = l.href === "/admin" ? pathname === "/admin" : pathname === l.href || pathname.startsWith(`${l.href}/`);
            return (
              <Link key={l.href} href={l.href} aria-current={active ? "page" : undefined}>
                {l.label}
              </Link>
            );
          })}
      </nav>
      <div className="admin-side-foot">
        <p className="admin-who">
          <b>{user?.name}</b>
          {user?.email} · {user?.role}
        </p>
        <Link href="/" className="admin-crumb">
          View site ↗
        </Link>
        <button type="button" className="btn ghost dark" onClick={onLogout}>
          Sign out
        </button>
      </div>
    </aside>
  );
}
