import { redirect } from "next/navigation";
import LoginForm from "../../../components/admin/LoginForm";
import { getCurrentUser } from "../../../lib/auth";

export const metadata = {
  title: "Sign in",
  robots: { index: false },
};

export default async function AdminLoginPage() {
  const user = await getCurrentUser();
  if (user) redirect("/admin");

  return (
    <main className="admin-login">
      <div className="admin-login-card">
        <p className="eyebrow">First Moto CMS</p>
        <h1>Sign in</h1>
        <p className="muted">Content management for the First Moto site.</p>
        <LoginForm />
      </div>
    </main>
  );
}
