import { redirect } from "next/navigation";
import AdminShell from "@/components/admin/AdminShell";
import { requireAdmin } from "@/lib/auth";

export const metadata = {
  title: "Admin — Uche Fashion International",
  robots: { index: false, follow: false },
};

export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // proxy.ts already blocks this route at the edge for non-admins, but the
  // layout should never trust that alone — it verifies the session itself
  // and only then renders anything, including the admin's real email.
  let admin;
  try {
    admin = await requireAdmin();
  } catch {
    redirect("/login?redirect=/admin");
  }

  return <AdminShell adminEmail={admin.email}>{children}</AdminShell>;
}
