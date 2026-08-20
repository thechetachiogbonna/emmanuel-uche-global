"use client";

import { useState } from "react";
import { formatDate } from "@/lib/admin/format";
import OrderStatusSelect from "@/components/admin/OrderStatusSelect";
import type { OrderStatus } from "@/lib/actions/admin-orders";

type Order = {
  id: string;
  customer: string;
  email: string;
  date: string;
  items: number;
  total: string;
  status: OrderStatus;
  paymentStatus: "unpaid" | "paid" | "failed";
};

const STATUSES: OrderStatus[] = [
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

export default function OrdersTable({ orders }: { orders: Order[] }) {
  const [filter, setFilter] = useState<OrderStatus | "all">("all");
  const filtered = orders.filter((o) => filter === "all" || o.status === filter);

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-5">
        {(["all", ...STATUSES] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 text-[12px] tracking-wide uppercase border transition-colors ${
              filter === s
                ? "bg-ink text-ivory border-ink"
                : "border-ink/20 text-ink-soft hover:border-ink"
            }`}
          >
            {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      <div className="border border-ink/10 bg-white overflow-x-auto">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-b border-ink/10 text-left text-ink-soft">
              <th className="px-4 py-3 font-normal">Order</th>
              <th className="px-4 py-3 font-normal">Customer</th>
              <th className="px-4 py-3 font-normal">Date</th>
              <th className="px-4 py-3 font-normal">Items</th>
              <th className="px-4 py-3 font-normal">Total</th>
              <th className="px-4 py-3 font-normal">Payment</th>
              <th className="px-4 py-3 font-normal">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((o) => (
              <tr key={o.id} className="border-b border-ink/5 last:border-0">
                <td className="px-4 py-3 font-mono text-[12px]">{o.id}</td>
                <td className="px-4 py-3">
                  <div>{o.customer}</div>
                  <div className="text-[11px] text-ink-soft">{o.email}</div>
                </td>
                <td className="px-4 py-3 text-ink-soft">{formatDate(o.date)}</td>
                <td className="px-4 py-3">{o.items}</td>
                <td className="px-4 py-3">{o.total}</td>
                <td className="px-4 py-3">
                  <span
                    className={`text-[12px] tracking-wide uppercase ${
                      o.paymentStatus === "paid"
                        ? "text-green-800"
                        : o.paymentStatus === "failed"
                          ? "text-red-700"
                          : "text-clay"
                    }`}
                  >
                    {o.paymentStatus}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <OrderStatusSelect orderId={o.id} status={o.status} />
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-ink-soft">
                  No orders with this status.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
