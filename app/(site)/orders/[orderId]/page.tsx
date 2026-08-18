import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getMyOrder } from "@/lib/customer/queries";
import { formatDate } from "@/lib/admin/format";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  const user = await getCurrentUser();
  if (!user) redirect(`/login?redirect=/orders/${orderId}`);

  const order = await getMyOrder(user.id, orderId);
  if (!order) notFound();

  return (
    <main className="flex-1 px-6 md:px-10 py-16 md:py-24 max-w-2xl mx-auto w-full">
      <p className="text-[12px] tracking-[0.18em] uppercase text-clay mb-3 text-center">
        Order Confirmed
      </p>
      <h1 className="font-display font-light italic text-4xl text-center mb-2">
        Thank you.
      </h1>
      <p className="text-[14px] text-ink-soft text-center mb-12">
        Order <span className="font-mono">{order.id}</span> placed on{" "}
        {formatDate(order.date)}
      </p>

      <div className="border-t border-ink/10 divide-y divide-ink/10 mb-8">
        {order.items.map((item, i) => (
          <div key={i} className="flex items-center gap-4 py-4">
            {/* eslint-disable-next-line @next/next/no-img-element -- product images are arbitrary external URLs */}
            <img
              src={item.img1}
              alt={item.name}
              className="w-14 h-18 object-cover bg-sand shrink-0"
            />
            <div className="flex-1 flex items-center justify-between gap-3">
              <div>
                <div className="text-[14px]">{item.name}</div>
                <div className="text-[12px] text-ink-soft">Qty {item.quantity}</div>
              </div>
              <span className="text-[13px] text-clay shrink-0">{item.price}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="border border-ink/10 p-6 mb-10">
        <div className="flex items-center justify-between text-[14px] mb-2">
          <span className="text-ink-soft">Status</span>
          <span className="tracking-wide uppercase">{order.status}</span>
        </div>
        <div className="flex items-center justify-between text-[16px] font-medium">
          <span>Total</span>
          <span>{order.total}</span>
        </div>
      </div>

      <div className="flex gap-3 justify-center">
        <Link
          href="/orders"
          className="border border-ink/20 text-[12px] tracking-[0.14em] uppercase px-6 py-3.5 hover:border-ink transition-colors"
        >
          View All Orders
        </Link>
        <Link
          href="/collections"
          className="bg-ink text-ivory text-[12px] tracking-[0.14em] uppercase px-6 py-3.5 hover:bg-clay transition-colors"
        >
          Continue Shopping
        </Link>
      </div>
    </main>
  );
}
