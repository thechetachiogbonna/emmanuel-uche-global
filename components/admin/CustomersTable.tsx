"use client";

import { useState } from "react";
import { formatDate } from "@/lib/admin/format";

type Customer = {
  id: string;
  name: string;
  email: string;
  joined: string;
  orders: number;
  totalSpent: string;
};

export default function CustomersTable({ customers }: { customers: Customer[] }) {
  const [query, setQuery] = useState("");
  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(query.toLowerCase()) ||
      c.email.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search customers..."
        className="w-full max-w-xs border border-ink/20 px-3 py-2 text-[13px] mb-5 outline-none focus:border-clay transition-colors"
      />

      <div className="border border-ink/10 bg-white overflow-x-auto">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-b border-ink/10 text-left text-ink-soft">
              <th className="px-4 py-3 font-normal">Customer</th>
              <th className="px-4 py-3 font-normal">Joined</th>
              <th className="px-4 py-3 font-normal">Orders</th>
              <th className="px-4 py-3 font-normal">Total Spent</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <tr key={c.id} className="border-b border-ink/5 last:border-0">
                <td className="px-4 py-3">
                  <div>{c.name}</div>
                  <div className="text-[11px] text-ink-soft">{c.email}</div>
                </td>
                <td className="px-4 py-3 text-ink-soft">{formatDate(c.joined)}</td>
                <td className="px-4 py-3">{c.orders}</td>
                <td className="px-4 py-3">{c.totalSpent}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-ink-soft">
                  No customers match &ldquo;{query}&rdquo;.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
