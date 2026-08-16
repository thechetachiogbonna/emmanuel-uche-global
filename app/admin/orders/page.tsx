import { getAdminOrders } from "@/lib/admin/queries";
import OrdersTable from "@/components/admin/OrdersTable";

export default async function OrdersPage() {
  const orders = await getAdminOrders();

  return (
    <div>
      <h1 className="font-display text-2xl md:text-3xl mb-1">Orders</h1>
      <p className="text-[13px] text-ink-soft mb-2">
        {orders.length} order{orders.length !== 1 ? "s" : ""} total
      </p>
      <p className="text-[12px] text-ink-soft mb-6 bg-sand/30 border border-ink/10 px-3 py-2 inline-block">
        These are real rows in Postgres, but seeded — the storefront still
        doesn&apos;t have a checkout flow, so nothing here came from an
        actual purchase yet.
      </p>
      <OrdersTable orders={orders} />
    </div>
  );
}
