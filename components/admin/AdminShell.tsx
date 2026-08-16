"use client";

import { logoutAction } from "@/lib/actions/auth";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const NAV = [
  { label: "Dashboard", href: "/admin" },
  { label: "Collections", href: "/admin/collections" },
  { label: "Orders", href: "/admin/orders" },
  { label: "Customers", href: "/admin/customers" },
  { label: "Settings", href: "/admin/settings" },
];

export default function AdminShell({
  children,
  adminEmail,
}: {
  children: React.ReactNode;
  adminEmail: string;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  const logout = async () => {
    await logoutAction();
    router.push("/");
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-[#FAF8F4] text-ink flex">
      <aside className="hidden md:flex w-60 shrink-0 flex-col border-r border-ink/10 bg-white">
        <div className="px-6 py-6 border-b border-ink/10">
          <div className="font-display italic text-2xl leading-none">
            Uche
          </div>
          <div className="text-[10px] tracking-[0.18em] uppercase text-ink-soft mt-1">
            Admin Console
          </div>
        </div>

        <nav className="flex-1 px-3 py-4">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`block px-3 py-2.5 mb-1 text-[13px] tracking-wide rounded-sm transition-colors ${
                isActive(item.href)
                  ? "bg-ink text-ivory"
                  : "text-ink-soft hover:bg-sand/40 hover:text-ink"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-ink/10 flex flex-col gap-1">
          <div className="px-3 py-1.5 text-[11px] text-ink-soft truncate" title={adminEmail}>
            {adminEmail}
          </div>
          <Link
            href="/"
            target="_blank"
            className="px-3 py-2.5 text-[13px] tracking-wide text-ink-soft hover:bg-sand/40 hover:text-ink rounded-sm transition-colors"
          >
            View Site ↗
          </Link>
          <button
            onClick={logout}
            className="text-left px-3 py-2.5 text-[13px] tracking-wide text-ink-soft hover:bg-sand/40 hover:text-ink rounded-sm transition-colors"
          >
            Log Out
          </button>
        </div>
      </aside>

      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b border-ink/10 flex items-center justify-between px-4 py-3">
        <div className="font-display italic text-xl">Uche Admin</div>
        <button onClick={logout} className="text-[12px] text-ink-soft">
          Log Out
        </button>
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        <div className="md:hidden h-14" />
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-ink/10 flex justify-around py-2">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`text-[10px] tracking-wide uppercase px-2 py-1 ${
                isActive(item.href) ? "text-clay font-semibold" : "text-ink-soft"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <main className="flex-1 px-5 md:px-10 py-8 md:py-10 pb-24 md:pb-10 max-w-6xl w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
