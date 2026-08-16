import Link from "next/link";
import { getAdminCollections, getAdminCustomers, getAdminOrders } from "@/lib/admin/queries";
import { formatDate } from "@/lib/admin/format";
import StatCard from "@/components/admin/StatCard";
import { OrderStatusBadge } from "@/components/admin/Badge";

export default async function AdminDashboard() {
  const [collections, orders, customers] = await Promise.all([
    getAdminCollections(),
    getAdminOrders(),
    getAdminCustomers(),
  ]);

  const totalProducts = collections.reduce((sum, c) => sum + c.products.length, 0);
  const liveCollections = collections.filter((c) => c.status === "available").length;
  const recentOrders = orders.slice(0, 5);

  return (
    <div>
      <h1 className="font-display text-2xl md:text-3xl mb-1">Dashboard</h1>
      <p className="text-[13px] text-ink-soft mb-8">
        A quick look at how the store is doing.
      </p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <StatCard
          label="Collections"
          value={String(collections.length)}
          sub={`${liveCollections} live`}
        />
        <StatCard label="Products" value={String(totalProducts)} />
        <StatCard label="Orders" value={String(orders.length)} />
        <StatCard label="Customers" value={String(customers.length)} />
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[13px] tracking-[0.1em] uppercase text-ink-soft">
              Recent Orders
            </h2>
            <Link
              href="/admin/orders"
              className="text-[12px] tracking-wide uppercase text-clay hover:underline"
            >
              View all
            </Link>
          </div>
          <div className="border border-ink/10 bg-white overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-ink/10 text-left text-ink-soft">
                  <th className="px-4 py-3 font-normal">Order</th>
                  <th className="px-4 py-3 font-normal">Customer</th>
                  <th className="px-4 py-3 font-normal">Date</th>
                  <th className="px-4 py-3 font-normal">Total</th>
                  <th className="px-4 py-3 font-normal">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((o) => (
                  <tr key={o.id} className="border-b border-ink/5 last:border-0">
                    <td className="px-4 py-3 font-mono text-[12px]">{o.id}</td>
                    <td className="px-4 py-3">{o.customer}</td>
                    <td className="px-4 py-3 text-ink-soft">{formatDate(o.date)}</td>
                    <td className="px-4 py-3">{o.total}</td>
                    <td className="px-4 py-3">
                      <OrderStatusBadge status={o.status} />
                    </td>
                  </tr>
                ))}
                {recentOrders.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-ink-soft">
                      No orders yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <h2 className="text-[13px] tracking-[0.1em] uppercase text-ink-soft mb-4">
            Collections
          </h2>
          <div className="border border-ink/10 bg-white divide-y divide-ink/5">
            {collections.map((c) => (
              <Link
                key={c.slug}
                href={`/admin/collections/${c.slug}`}
                className="flex items-center justify-between px-4 py-3 hover:bg-sand/20 transition-colors"
              >
                <span className="text-[13px]">{c.name}</span>
                <span className="text-[12px] text-ink-soft">
                  {c.products.length} pieces
                </span>
              </Link>
            ))}
            {collections.length === 0 && (
              <p className="px-4 py-4 text-[13px] text-ink-soft">
                No collections yet.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
