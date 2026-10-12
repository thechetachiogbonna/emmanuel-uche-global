"use client";

import Link from "next/link";
import { formatDate } from "@/lib/admin/format";

type Order = {
  id: string;
  status: string;
  paymentStatus: string;
  total: string;
  itemCount: number;
  date: string;
  items: {
    name: string;
    price: string;
    quantity: number;
    img1: string;
  }[];
};

type AccountViewProps = {
  user: {
    id: string;
    name: string;
    email: string;
  };
  orders: Order[];
};

export default function AccountView({ user, orders }: AccountViewProps) {
  const itemCount = orders.reduce((total, order) => total + order.itemCount, 0);
  return (
    <div className="w-full max-w-5xl mx-auto px-6 md:px-12 py-16 md:py-24 font-sans">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-start">
        {/* Left Column: Order History */}
        <div className="flex flex-col justify-center items-center">
          <h2 className="text-[17px] font-normal tracking-normal text-black mb-4">
            Order History
          </h2>
          <p className="text-[13.5px] text-neutral-600 leading-relaxed max-w-sm mb-6">
            View and track your recent and past orders here
          </p>

          {orders.length === 0 ? (
            <Link
              href="/collections"
              className="inline-block border border-black bg-transparent px-8 py-2.5 text-[13px] font-normal text-black hover:bg-black hover:text-white transition-colors"
            >
              Shop Now
            </Link>
          ) : (
            <div className="w-full space-y-4">
              <div className="border-t border-b border-black/10 divide-y divide-black/10">
                {orders.slice(0, 3).map((o) => (
                  <Link
                    key={o.id}
                    href={`/orders/${o.id}`}
                    className="flex items-center justify-between py-3 hover:bg-black/5 transition-colors px-1"
                  >
                    <div>
                      <span className="text-[13px] font-mono block text-black">
                        #{o.id.slice(0, 10)}
                      </span>
                      <span className="text-[12px] text-neutral-500">
                        {formatDate(o.date)} · {o.itemCount} item
                        {o.itemCount !== 1 ? "s" : ""}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[13px] font-medium text-black block">
                        {o.total}
                      </span>
                      <span
                        className={`text-[11px] uppercase tracking-wider ${
                          o.paymentStatus === "paid"
                            ? "text-green-700"
                            : "text-amber-700"
                        }`}
                      >
                        {o.status}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
              <div className="flex gap-3 pt-2">
                <Link
                  href="/orders"
                  className="inline-block border border-black/30 px-5 py-2 text-[12px] font-normal text-black hover:border-black transition-colors"
                >
                  View All Orders ({orders.length})
                </Link>
                <Link
                  href="/collections"
                  className="inline-block border border-black bg-black text-white px-5 py-2 text-[12px] font-normal hover:bg-neutral-800 transition-colors"
                >
                  Shop Now
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Account Details */}
        <div className="flex flex-col items-start md:border-l md:border-black/15 md:pl-16">
          <h2 className="text-[17px] font-normal tracking-normal text-black mb-4">
            Account Details
          </h2>
          <div className="w-full border-y border-black/10 py-5">
            <p className="text-[11px] uppercase tracking-[0.14em] text-neutral-500">
              Name
            </p>
            <p className="mt-1 text-[14px] text-black">{user.name}</p>
          </div>
          <div className="w-full border-b border-black/10 py-5">
            <p className="text-[11px] uppercase tracking-[0.14em] text-neutral-500">
              Email
            </p>
            <p className="mt-1 break-all text-[14px] text-black">{user.email}</p>
          </div>
          <div className="grid w-full grid-cols-2 gap-4 py-5">
            <div>
              <p className="text-[11px] uppercase tracking-[0.14em] text-neutral-500">
                Orders
              </p>
              <p className="mt-1 text-[18px] text-black">{orders.length}</p>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.14em] text-neutral-500">
                Items ordered
              </p>
              <p className="mt-1 text-[18px] text-black">{itemCount}</p>
            </div>
          </div>
          <p className="text-[13px] leading-relaxed text-neutral-600">
            Your order history and payment updates are available here whenever
            you need them.
          </p>
          <Link
            href="/orders"
            className="mt-6 border border-black bg-transparent px-6 py-2.5 text-[13px] font-normal text-black transition-colors hover:bg-black hover:text-white"
          >
            View Order History
          </Link>
        </div>
      </div>
    </div>
  );
}
