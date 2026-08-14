"use client";

import { useState } from "react";
import { useAdminOrders } from "@/lib/admin/useAdminData";
import { formatDate } from "@/lib/admin/format";
import type { OrderStatus } from "@/lib/admin/types";

const STATUSES: OrderStatus[] = [
  "Pending",
  "Processing",
  "Shipped",
  "Delivered",
  "Cancelled",
];

export default function OrdersPage() {
  const { orders, setStatus } = useAdminOrders();
  const [filter, setFilter] = useState<OrderStatus | "All">("All");

  const filtered = orders.filter((o) => filter === "All" || o.status === filter);

  return (
    <div>
      <h1 className="font-display text-2xl md:text-3xl mb-1">Orders</h1>
      <p className="text-[13px] text-ink-soft mb-2">
        {orders.length} order{orders.length !== 1 ? "s" : ""} total
      </p>
      <p className="text-[12px] text-ink-soft mb-6 bg-sand/30 border border-ink/10 px-3 py-2 inline-block">
        Preview data — the storefront doesn&apos;t have a checkout flow yet,
        so nothing here comes from real purchases.
      </p>

      <div className="flex flex-wrap gap-2 mb-5">
        {(["All", ...STATUSES] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 text-[12px] tracking-wide uppercase border transition-colors ${
              filter === s
                ? "bg-ink text-ivory border-ink"
                : "border-ink/20 text-ink-soft hover:border-ink"
            }`}
          >
            {s}
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
                  <select
                    value={o.status}
                    onChange={(e) =>
                      setStatus(o.id, e.target.value as OrderStatus)
                    }
                    className="border border-ink/15 bg-white text-[12px] px-2 py-1.5 outline-none focus:border-clay"
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-ink-soft">
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
