import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getMyOrders } from "@/lib/customer/queries";
import { formatDate } from "@/lib/admin/format";

export default async function MyOrdersPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?redirect=/orders");

  const orders = await getMyOrders(user.id);

  return (
    <main className="flex-1 px-6 md:px-10 py-16 md:py-24">
      <h1 className="font-display font-light italic text-4xl mb-2">
        Your Orders
      </h1>
      <p className="text-[14px] text-ink-soft mb-10">
        {orders.length} order{orders.length !== 1 ? "s" : ""}
      </p>

      {orders.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-[14px] text-ink-soft mb-6">
            You haven&apos;t placed an order yet.
          </p>
          <Link
            href="/collections"
            className="inline-block bg-ink text-ivory text-[12px] tracking-[0.14em] uppercase px-6 py-3.5 hover:bg-clay transition-colors"
          >
            Shop Collections
          </Link>
        </div>
      ) : (
        <div className="border-t border-ink/10 divide-y divide-ink/10">
          {orders.map((o) => (
            <Link
              key={o.id}
              href={`/orders/${o.id}`}
              className="flex items-center justify-between py-5 hover:bg-sand/20 transition-colors px-2 -mx-2"
            >
              <div>
                <div className="text-[14px] font-mono">{o.id}</div>
                <div className="text-[12px] text-ink-soft mt-1">
                  {formatDate(o.date)} · {o.itemCount} item{o.itemCount !== 1 ? "s" : ""}
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span
                  className={`text-[12px] tracking-wide uppercase ${
                    o.paymentStatus === "paid" ? "text-green-800" : "text-clay"
                  }`}
                >
                  {o.paymentStatus}
                </span>
                <span className="text-[13px] tracking-wide uppercase text-ink-soft">
                  {o.status}
                </span>
                <span className="text-[14px] text-clay">{o.total}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
