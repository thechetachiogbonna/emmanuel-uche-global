"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { updateOrderStatusAction, type OrderStatus } from "@/lib/actions/admin-orders";

const STATUSES: OrderStatus[] = [
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

export default function OrderStatusSelect({
  orderId,
  status,
}: {
  orderId: string;
  status: OrderStatus;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <select
      value={status}
      disabled={pending}
      onChange={(e) => {
        const next = e.target.value as OrderStatus;
        startTransition(async () => {
          await updateOrderStatusAction(orderId, next);
          router.refresh();
        });
      }}
      className="border border-ink/15 bg-white text-[12px] px-2 py-1.5 outline-none focus:border-clay disabled:opacity-60"
    >
      {STATUSES.map((s) => (
        <option key={s} value={s}>
          {s.charAt(0).toUpperCase() + s.slice(1)}
        </option>
      ))}
    </select>
  );
}
