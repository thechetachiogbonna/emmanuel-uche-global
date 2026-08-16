import AdminShell from "@/components/admin/AdminShell";

export const metadata = {
  title: "Admin — Uche Fashion International",
  robots: { index: false, follow: false },
};

export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return <AdminShell adminEmail={"admin@uchefashion.com"}>{children}</AdminShell>;
}
